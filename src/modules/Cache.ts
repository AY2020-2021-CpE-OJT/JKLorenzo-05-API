import PBData from "../structures/PBData.js";

const _cache = new Map<string, PBData>();
let _ordered = false;
let _valid = false;

export function get(id: string): PBData | undefined {
  return _cache.get(id);
}

export function getAll(): PBData[] {
  return [..._cache.values()];
}

export function update(data: PBData): void {
  _cache.set(data.id, data);
}

export function updateAll(data: PBData[]): void {
  _cache.clear();
  for (const this_data of data) {
    update(this_data);
  }
  _ordered = true;
  _valid = true;
}

export function remove(id: string): void {
  _cache.delete(id);
}

export function isOrdered(): boolean {
  return _ordered;
}

export function invalidateOrder(): void {
  _ordered = false;
}

export function isValid(): boolean {
  return _valid;
}

export function invalidateCache(): void {
  _valid = false;
}
