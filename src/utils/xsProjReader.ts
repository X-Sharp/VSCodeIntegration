import { parseXml, findElement, findElements, children, attr, tagName, elementText } from './msbuildXml';

export class xsProjReader {
  private values: Record<string, string>;
  private configGroups: Map<string, Record<string, string>> = new Map();

  constructor(xmlContent: string) {
    const ast = parseXml(xmlContent);
    const project = findElement(ast, 'Project');
    const projectChildren = project ? children(project) : [];
    const groups = findElements(projectChildren, 'PropertyGroup');

    // First unconditioned group → global properties
    const globalGroup = groups.find((g: any) => !attr(g, 'Condition')) ?? groups[0];
    this.values = globalGroup ? this.normalizePropertyGroup(globalGroup) : {};

    // Groups with a Condition → per-configuration (same config may appear in
    // multiple PropertyGroups; merge them so we see the union of all properties).
    for (const group of groups) {
      const condition: string = attr(group, 'Condition') ?? '';
      // Matches: '$(Configuration)|$(Platform)' == 'Debug|AnyCPU'
      const match = condition.match(/==\s*['"]([^|'"]+)\|/);
      if (match) {
        const configName = match[1].trim();
        const existing = this.configGroups.get(configName) ?? {};
        this.configGroups.set(configName, { ...existing, ...this.normalizePropertyGroup(group) });
      }
    }
  }

  /** Configuration names found in the project (e.g. ['Debug', 'Release']). */
  public getConfigs(): string[] {
    return Array.from(this.configGroups.keys());
  }

  /** Property from the per-configuration group for the given config. */
  public getForConfig(config: string, key: string): string | undefined {
    return this.configGroups.get(config)?.[key.toLowerCase()];
  }

  /**
   * Property resolved for a specific configuration:
   * looks in the config-specific group first, then falls back to the global group.
   */
  public resolveForConfig(config: string, key: string): string | undefined {
    return this.getForConfig(config, key) ?? this.get(key);
  }

  public getAll(): Record<string, string> {
    return this.values;
  }

  public get(key: string): string | undefined {
    return this.values[key.toLowerCase()];
  }

  public getBool(key: string, defaultValue = false): boolean {
    const val = this.get(key);
    return val?.toLowerCase() === 'true' ? true : defaultValue;
  }

  public getInt(key: string, defaultValue = 0): number {
    const val = parseInt(this.get(key) ?? '', 10);
    return isNaN(val) ? defaultValue : val;
  }

  public getDouble(key: string, defaultValue = 0): number {
    const val = parseFloat(this.get(key) ?? '');
    return isNaN(val) ? defaultValue : val;
  }

  private normalizePropertyGroup(group: any): Record<string, string> {
    const result: Record<string, string> = {};
    for (const child of children(group)) {
      const tag = tagName(child);
      if (!tag) { continue; } // skip text/comment nodes
      result[tag.toLowerCase()] = elementText(child);
    }
    return result;
  }
}
