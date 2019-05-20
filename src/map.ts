export class JSONMap<K, V> {
  inner: Map<string, V>;

  // not sure how to restrict the parameter type more
  constructor(iterable?: any) {
    this.inner = new Map(iterable);
  }

  get size(): number {
    return this.inner.size;
  }

  clear() {
    this.inner.clear();
  }

  delete(key: K): boolean {
    return this.inner.delete(JSON.stringify(key));
  }

  // the original Map.entries returns an Iterator, not an array
  entries(): [K, V][] {
    return Array.from(this.inner.entries()).map(([k, v]) => [JSON.parse(k), v]);
  }

  // the original Map.forEach also takes a thisArg parameter
  forEach(callbackFn: (k: K, v: V, m: JSONMap<K, V>) => void) {
    this.entries().forEach(([k, v]) => callbackFn(k, v, this));
  }

  get(key: K): V {
    return this.inner.get(JSON.stringify(key));
  }

  has(key: K): boolean {
    return this.inner.has(JSON.stringify(key));
  }

  // the original Map.keys returns an Iterator, not an array
  keys(): K[] {
    return Array.from(this.inner.keys()).map(k => JSON.parse(k));
  }

  set(key: K, value: V): JSONMap<K, V> {
    this.inner.set(JSON.stringify(key), value);
    return this;
  }

  // the original Map.values returns an Iterator, not an array
  values(): V[] {
    return Array.from(this.inner.values());
  }
}
