import { useState, useEffect, useCallback, useRef } from "react";
import type { AxiosResponse } from "axios";

interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useQuery<T>(
  key: unknown[],
  fetcher: () => Promise<AxiosResponse<T>>,
  options?: { enabled?: boolean; refetchInterval?: number }
): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher();
      setData(res.data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key.join(",")]);

  useEffect(() => {
    if (options?.enabled === false) return;
    fetch();
  }, [fetch, options?.enabled]);

  useEffect(() => {
    if (options?.refetchInterval && options?.enabled !== false) {
      intervalRef.current = setInterval(fetch, options.refetchInterval);
      return () => clearInterval(intervalRef.current);
    }
  }, [fetch, options?.refetchInterval, options?.enabled]);

  return { data, loading, error, refetch: fetch };
}
