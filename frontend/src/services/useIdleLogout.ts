import { useEffect, useRef, useCallback } from "react";

interface UseIdleLogoutOptions {
  timeoutMs: number;
  warnBeforeMs?: number;
  onWarning?: () => void;
  onLogout?: () => void;
  enabled?: boolean;
}

/**
 * Auto‑logout after `timeoutMs` of inactivity.
 * Fires `onWarning` `warnBeforeMs` before logout.
 */
export function useIdleLogout({
  timeoutMs,
  warnBeforeMs = 60000,
  onWarning,
  onLogout,
  enabled = true,
}: UseIdleLogoutOptions) {
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warned = useRef(false);

  const reset = useCallback(() => {
    if (!enabled) return;

    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (warnTimer.current) clearTimeout(warnTimer.current);

    warned.current = false;

    // Warning timer
    warnTimer.current = setTimeout(() => {
      if (warned.current) return;
      warned.current = true;
      onWarning?.();
    }, Math.max(timeoutMs - warnBeforeMs, 0));

    // Logout timer
    logoutTimer.current = setTimeout(() => {
      onLogout?.();
    }, timeoutMs);
  }, [timeoutMs, warnBeforeMs, onWarning, onLogout, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ] as const;

    const handler = () => reset();

    events.forEach((e) =>
      window.addEventListener(e, handler, { passive: true })
    );

    reset();

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
      if (warnTimer.current) clearTimeout(warnTimer.current);
    };
  }, [reset, enabled]);
}
