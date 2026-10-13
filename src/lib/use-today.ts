import { useEffect, useState } from "react";
import { todayInputValue } from "./date-utils";

export function useToday() {
  const [today, setToday] = useState(todayInputValue);
  useEffect(() => {
    const refresh = () => setToday(todayInputValue());
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  return today;
}
