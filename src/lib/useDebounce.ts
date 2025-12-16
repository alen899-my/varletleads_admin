import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timer to update the value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timer if the value changes (user types again)
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}