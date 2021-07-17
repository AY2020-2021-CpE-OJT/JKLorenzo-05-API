import { PBData } from "../structures/PBData";

const _cache = new Map<string, PBData>();
let _ordered = false;
let _valid = false;

export default class CacheManager {
  static get(id: string): PBData | undefined {
    return _cache.get(id);
  }

  static getAll(): PBData[] {
    return [..._cache.values()];
  }

  static update(data: PBData): void {
    _cache.set(data.id, data);
  }

  static updateAll(data: PBData[]): void {
    _cache.clear();
    for (const this_data of data) {
      this.update(this_data);
    }
    _ordered = true;
    _valid = true;
  }

  static delete(id: string): void {
    _cache.delete(id);
  }

  static isOrdered(): boolean {
    return _ordered;
  }

  static invalidateOrder(): void {
    _ordered = false;
  }

  static isValid(): boolean {
    return _valid;
  }

  static invalidateCache(): void {
    _valid = false;
  }
}
