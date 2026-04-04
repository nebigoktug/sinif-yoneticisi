import { useState, useEffect } from "react";

const listeners = {};

export function useStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    if (!listeners[key]) listeners[key] = new Set();
    listeners[key].add(setValue);
    return () => listeners[key].delete(setValue);
  }, [key]);

  function set(newValue) {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
    if (listeners[key]) {
      listeners[key].forEach((fn) => { if (fn !== setValue) fn(newValue); });
    }
  }

  return [value, set];
}