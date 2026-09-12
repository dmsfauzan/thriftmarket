"use client";
import { useEffect, useState } from "react";

export function useDarkMode() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("thrift-theme");
      const initial = saved ? saved === "dark" : false;
      setDark(initial);
      document.documentElement.classList.toggle("dark", initial);
    } catch {
      setDark(false);
    }
  }, []);

  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("thrift-theme", next ? "dark" : "light");
      } catch {
        /* abaikan */
      }
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  return { dark, toggle };
}
