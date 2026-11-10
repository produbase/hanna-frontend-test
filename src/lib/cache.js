import { readStored, removeStored, writeStored } from "./storage";

export const CACHE_TTL = 60 * 60 * 1000;

// Dependency injection keeps expiration, failure and concurrency tests deterministic.
export function createCache({ now = Date.now, ttl = CACHE_TTL } = {}) {
  const memory = new Map();
  const pending = new Map();

  return {
    async get(key, load, validate = () => true) {
      const storageKey = `itx:cache:v1:${key}`;
      const cached = memory.get(key) ?? readStored(storageKey);
      if (
        cached &&
        Number.isFinite(cached.expiresAt) &&
        cached.expiresAt > now() &&
        cached.expiresAt <= now() + ttl &&
        validate(cached.value)
      ) {
        memory.set(key, cached);
        return cached.value;
      }
      memory.delete(key);
      removeStored(storageKey);
      if (pending.has(key)) return pending.get(key);

      const request = Promise.resolve()
        .then(load)
        .then((value) => {
          if (!validate(value))
            throw new Error(
              "El servicio devolvió datos que no podemos mostrar.",
            );
          const entry = { value, expiresAt: now() + ttl };
          memory.set(key, entry);
          writeStored(storageKey, entry);
          return value;
        })
        .finally(() => pending.delete(key));
      pending.set(key, request);
      return request;
    },
  };
}
