import { XMLParser, XMLBuilder } from 'fast-xml-parser';

/**
 * Shared helpers for reading/writing MSBuild-style XML (.xsproj) using
 * fast-xml-parser's `preserveOrder` AST shape, which keeps comments and
 * element order intact across a parse -> rebuild round-trip (the default
 * object-keyed mode silently drops comments and reorders nodes).
 *
 * AST node shapes:
 *   element:  { TagName: [...children], ':@'?: { '@_Attr': 'value' } }
 *   text:     { '#text': value }
 *   comment:  { '#comment': [{ '#text': '...' }] }
 */

const PARSE_OPTIONS = {
  ignoreAttributes: false,
  preserveOrder: true,
  commentPropName: '#comment',
};

const BUILD_OPTIONS = {
  ...PARSE_OPTIONS,
  format: true,
  suppressEmptyNode: true,
};

export function parseXml(xmlText: string): any[] {
  return new XMLParser(PARSE_OPTIONS).parse(xmlText);
}

export function buildXml(ast: any[]): string {
  return new XMLBuilder(BUILD_OPTIONS).build(ast);
}

/** Tag name of an element node, or undefined for text/comment nodes. */
export function tagName(node: any): string | undefined {
  const keys = Object.keys(node).filter(k => k !== ':@');
  return keys.length === 1 && !keys[0].startsWith('#') ? keys[0] : undefined;
}

/** Children array of an element node ([] for text/comment nodes). */
export function children(node: any): any[] {
  const tag = tagName(node);
  return tag ? node[tag] : [];
}

/** Attribute value (without the `@_` prefix), or undefined when absent. */
export function attr(node: any, name: string): string | undefined {
  return node[':@']?.[`@_${name}`];
}

/** First element child with the given tag name. */
export function findElement(nodes: any[], tag: string): any | undefined {
  return nodes.find(n => tagName(n) === tag);
}

/** All element children with the given tag name. */
export function findElements(nodes: any[], tag: string): any[] {
  return nodes.filter(n => tagName(n) === tag);
}

/** Text content of a leaf element, e.g. <Foo>Bar</Foo> -> 'Bar'. */
export function elementText(node: any): string {
  const text = children(node).find((c: any) => '#text' in c);
  return text ? String(text['#text']) : '';
}

/**
 * Create or update a child element's text content. Mirrors plain
 * object-property assignment (`group.AssemblyName = value`) — always writes,
 * even when `value` is an empty string.
 */
export function setElementText(nodes: any[], tag: string, value: string): void {
  const existing = findElement(nodes, tag);
  if (existing) {
    existing[tag] = [{ '#text': value }];
  } else {
    nodes.push({ [tag]: [{ '#text': value }] });
  }
}

/** Remove every element child with the given tag name. */
export function removeElement(nodes: any[], tag: string): void {
  for (let i = nodes.length - 1; i >= 0; i--) {
    if (tagName(nodes[i]) === tag) {
      nodes.splice(i, 1);
    }
  }
}

/**
 * Write the element's text content when `value` is non-empty, otherwise
 * remove it. Mirrors the per-config delete-when-empty `set()` helper that
 * avoids littering the file with empty properties.
 */
export function setOrRemoveElementText(nodes: any[], tag: string, value: string | undefined): void {
  if (value !== undefined && value !== '') {
    setElementText(nodes, tag, value);
  } else {
    removeElement(nodes, tag);
  }
}
