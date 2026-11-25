"use client";

import { useEffect, useState } from "react";

export default function useGlobalQuery() {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const sync = () =>
      setQuery(new URLSearchParams(window.location.search).get("q") ?? "");
    sync();
    window.addEventListener("taskadoo-search", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("taskadoo-search", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  return query;
}
