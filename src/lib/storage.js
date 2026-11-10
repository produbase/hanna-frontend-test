// Storage may be unavailable (private browsing, quota or browser policy).
export function readStored(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}

export function writeStored(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* In-memory state remains usable. */ }
}

export function removeStored(key) {
  try { localStorage.removeItem(key); } catch { /* Best-effort cleanup. */ }
}
