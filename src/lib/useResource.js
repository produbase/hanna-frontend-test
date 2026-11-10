import { useEffect, useState } from 'react';

export function useResource(key, load) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const requestKey = `${key}:${attempt}`;
  useEffect(() => {
    let active = true;
    load().then(
      (data) => { if (active) setResult({ key: requestKey, data }); },
      (error) => { if (active) setResult({ key: requestKey, error }); },
    );
    // Ignore late results after navigation; shared cache requests remain useful to other consumers.
    return () => { active = false; };
  }, [requestKey, load]);
  return {
    data: result?.key === requestKey ? result.data : undefined,
    error: result?.key === requestKey ? result.error : undefined,
    loading: result?.key !== requestKey,
    retry: () => setAttempt((value) => value + 1),
  };
}
