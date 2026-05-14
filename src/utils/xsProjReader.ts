import * as vscode from 'vscode';
import * as fs from 'fs';
import { XMLParser } from 'fast-xml-parser';

export class xsProjReader {
  private values: Record<string, string>;

  constructor(xmlContent: string) {
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xmlContent);

    // Get the first PropertyGroup (multiple groups become an array in fast-xml-parser)
    const rawGroup = parsed?.Project?.PropertyGroup;
    const propertyGroup = Array.isArray(rawGroup) ? rawGroup[0] : rawGroup;

    if (!propertyGroup || typeof propertyGroup !== 'object') {
      this.values = {};
    } else {
      this.values = this.normalizePropertyGroup(propertyGroup);
    }

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

    for (const [key, value] of Object.entries(group)) {
      const lower = key.toLowerCase();

      if (typeof value === "string") {
        result[lower] = value;
      } else if (Array.isArray(value)) {
        // On prend la première valeur ou on concatène selon ton besoin
        result[lower] = String(value[0]);
      } else {
        result[lower] = String(value);
      }
    }

    return result;
  }
}