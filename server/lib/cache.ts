type Entry<T> = { value: T; storedAt: number };

export type CacheOptions = {
  ttlMs: number;
  staleTtlMs: number;
  maxEntries: number;
  now?: () => number;
};

export class TtlCache<T> {
  private readonly entries = new Map<string, Entry<T>>();
  private readonly inFlight = new Map<string, Promise<T>>();
  private readonly now: () => number;

  constructor(private readonly options: CacheOptions) {
    this.now = options.now ?? Date.now;
  }

  async getOrLoad(key: string, loader: () => Promise<T>): Promise<T> {
    const entry = this.entries.get(key);
    const age = entry ? this.now() - entry.storedAt : Infinity;
    if (entry && age < this.options.ttlMs) return entry.value;

    const pending = this.inFlight.get(key);
    if (pending) return pending;

    const load = loader()
      .then((value) => {
        this.set(key, value);
        return value;
      })
      .catch((error: unknown) => {
        if (entry && age < this.options.staleTtlMs) return entry.value;
        throw error;
      })
      .finally(() => this.inFlight.delete(key));

    this.inFlight.set(key, load);
    return load;
  }

  private set(key: string, value: T): void {
    this.entries.delete(key);
    this.entries.set(key, { value, storedAt: this.now() });
    if (this.entries.size > this.options.maxEntries) {
      const oldestKey = this.entries.keys().next().value;
      if (oldestKey !== undefined) this.entries.delete(oldestKey);
    }
  }
}
