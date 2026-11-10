import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CACHE_TTL, createCache } from './cache';

describe('caché de lecturas', () => {
  beforeEach(() => localStorage.clear());
  it('reutiliza la respuesta durante una hora y revalida justo al caducar', async () => {
    let now = 100;
    const cache = createCache({ now: () => now });
    const load = vi.fn().mockResolvedValueOnce(['primero']).mockResolvedValueOnce(['nuevo']);
    expect(await cache.get('list', load)).toEqual(['primero']);
    now += CACHE_TTL - 1;
    expect(await cache.get('list', load)).toEqual(['primero']);
    expect(load).toHaveBeenCalledTimes(1);
    now += 1;
    expect(await cache.get('list', load)).toEqual(['nuevo']);
    expect(load).toHaveBeenCalledTimes(2);
  });
  it('recupera datos persistidos tras crear otra instancia', async () => {
    await createCache().get('list', () => Promise.resolve([1]));
    const load = vi.fn();
    expect(await createCache().get('list', load)).toEqual([1]);
    expect(load).not.toHaveBeenCalled();
  });
  it('comparte una única petición simultánea', async () => {
    const cache = createCache();
    const load = vi.fn().mockResolvedValue([1]);
    expect(await Promise.all([cache.get('list', load), cache.get('list', load)])).toEqual([[1], [1]]);
    expect(load).toHaveBeenCalledTimes(1);
  });
  it('no guarda errores y permite volver a intentar', async () => {
    const cache = createCache();
    const load = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce([2]);
    await expect(cache.get('list', load)).rejects.toThrow('offline');
    expect(await cache.get('list', load)).toEqual([2]);
  });
  it('descarta JSON corrupto, formas inválidas y fechas absurdas', async () => {
    localStorage.setItem('itx:cache:v1:list', '{');
    expect(await createCache().get('list', async () => [1], Array.isArray)).toEqual([1]);
    localStorage.setItem('itx:cache:v1:list', JSON.stringify({ value: 'bad', expiresAt: Date.now() + 50000 }));
    const load = vi.fn().mockResolvedValue([2]);
    expect(await createCache().get('list', load, Array.isArray)).toEqual([2]);
    localStorage.setItem('itx:cache:v1:list', JSON.stringify({ value: [8], expiresAt: Date.now() + CACHE_TTL * 100 }));
    expect(await createCache().get('list', load)).toEqual([2]);
  });
  it('no guarda respuestas con contrato inválido', async () => {
    await expect(createCache().get('list', async () => null, Array.isArray)).rejects.toThrow('datos');
    expect(localStorage.getItem('itx:cache:v1:list')).toBeNull();
  });
  it('sigue funcionando en memoria si localStorage está bloqueado', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('denied'); });
    const load = vi.fn().mockResolvedValue([1]);
    const cache = createCache();
    await cache.get('a', load);
    expect(await cache.get('a', load)).toEqual([1]);
    expect(load).toHaveBeenCalledTimes(1);
  });
});
