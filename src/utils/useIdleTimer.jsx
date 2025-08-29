import { useEffect, useRef } from "react";

/**
 * Custom hook to detect user inactivity.
 * @param {Function} onTimeout - Callback when timeout occurs.
 * @param {number} timeout - Timeout duration in ms (default: 20 minutes).
 */
export const useIdleTimer = (onTimeout, timeout = 20 * 60 * 1000) => {
  const timer = useRef(null);

  const resetTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(onTimeout, timeout);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click"];
    events.forEach((e) => window.addEventListener(e, resetTimer));

    resetTimer(); // start timer

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
};
