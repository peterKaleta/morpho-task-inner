export type CacheSetOptions = {
  ttlSeconds: number;
};

export type JsonCache = {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options: CacheSetOptions): Promise<void>;
  getOrSet<T>(
    key: string,
    options: CacheSetOptions,
    load: () => Promise<T>,
  ): Promise<T>;
};
