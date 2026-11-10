import { act, renderHook, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { useResource } from "./useResource";

it("descarta una respuesta tardía del producto anterior al cambiar de ficha", async () => {
  let resolvePrevious;
  let resolveCurrent;
  const load = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePrevious = resolve;
        }),
    )
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveCurrent = resolve;
        }),
    );
  const { result, rerender } = renderHook(({ id }) => useResource(id, load), {
    initialProps: { id: "previous" },
  });
  rerender({ id: "current" });
  expect(result.current.loading).toBe(true);
  await act(async () => {
    resolveCurrent({ id: "current" });
  });
  expect(result.current.data).toEqual({ id: "current" });
  await act(async () => {
    resolvePrevious({ id: "previous" });
  });
  expect(result.current.data).toEqual({ id: "current" });
});

it("limpia el dato anterior mientras carga otra ficha y permite reintentar", async () => {
  const load = vi
    .fn()
    .mockResolvedValueOnce({ id: "first" })
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce({ id: "second" });
  const { result, rerender } = renderHook(({ id }) => useResource(id, load), {
    initialProps: { id: "first" },
  });
  await waitFor(() => expect(result.current.data).toEqual({ id: "first" }));
  rerender({ id: "second" });
  expect(result.current.loading).toBe(true);
  expect(result.current.data).toBeUndefined();
  await waitFor(() => expect(result.current.error?.message).toBe("offline"));
  act(() => result.current.retry());
  expect(result.current.loading).toBe(true);
  await waitFor(() => expect(result.current.data).toEqual({ id: "second" }));
  expect(result.current.error).toBeUndefined();
});
