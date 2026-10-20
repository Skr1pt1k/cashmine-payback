const KEY = 'cashmine.token';

/** Token lives only in the browser (localStorage). Storage may be unavailable (private mode), so never throw. */
export const tokenStorage = {
  get(): string | null {
    try {
      return globalThis.localStorage?.getItem(KEY) ?? null;
    } catch {
      return null;
    }
  },
  set(token: string): void {
    try {
      globalThis.localStorage?.setItem(KEY, token);
    } catch {
      // ignore: token stays in memory for this session
    }
  },
  clear(): void {
    try {
      globalThis.localStorage?.removeItem(KEY);
    } catch {
      // ignore
    }
  },
};
