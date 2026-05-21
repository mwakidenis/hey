import { useEffect, useRef } from "react";

interface UseIntervalWhenOptions {
  ms: number;
  startImmediately: boolean;
  when: boolean;
}

export const useIntervalWhen = (
  callback: () => Promise<unknown> | unknown,
  { ms, startImmediately, when }: UseIntervalWhenOptions
) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!when) {
      return;
    }

    if (startImmediately) {
      void callbackRef.current();
    }

    const intervalId = window.setInterval(() => {
      void callbackRef.current();
    }, ms);

    return () => window.clearInterval(intervalId);
  }, [ms, startImmediately, when]);
};
