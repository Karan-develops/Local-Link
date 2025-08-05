"use client";

import { useEffect } from "react";
import { watchAndRefreshSession } from "@/utils/refreshSessionCookie";

export default function SessionWatcher() {
  useEffect(() => {
    watchAndRefreshSession();
  }, []);

  return null;
}
