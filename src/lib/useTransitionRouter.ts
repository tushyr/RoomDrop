"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * Thin wrapper around useRouter — calls push() immediately.
 * No transition delay — the sessionStorage optimistic path in RoomLoader
 * makes the room page render instantly without waiting for the server.
 */
export function useTransitionRouter() {
  const router = useRouter();

  const push = useCallback(
    (url: string) => {
      router.push(url);
    },
    [router]
  );

  return { push };
}
