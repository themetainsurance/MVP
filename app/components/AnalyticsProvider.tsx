"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  isDoNotTrackEnabled,
  type AnalyticsAttribution,
  type AnalyticsInsuranceType,
  type TrackFormStartedInput,
} from "../lib/analytics-types";
import { isAnalyticsPath } from "../lib/analytics-validation";

type AnalyticsContextValue = {
  getAnalyticsSessionId: () => string | null;
  trackFormStarted: (input: TrackFormStartedInput) => void;
};

const AnalyticsContext = createContext<AnalyticsContextValue>({
  getAnalyticsSessionId: () => null,
  trackFormStarted: () => {},
});

function doNotTrackIsActive() {
  return typeof navigator !== "undefined" &&
    isDoNotTrackEnabled(navigator.doNotTrack);
}

function boundedQueryValue(
  params: URLSearchParams,
  key: string,
  maxLength: number
) {
  const value = params.get(key)?.trim() ?? "";
  if (!value || value.length > maxLength || /[\u0000-\u001f\u007f]/.test(value)) {
    return null;
  }
  return value;
}

function captureAttribution(landingPath: string): AnalyticsAttribution {
  const params = new URLSearchParams(window.location.search);
  let referrerHost: string | null = null;

  if (document.referrer) {
    try {
      const hostname = new URL(document.referrer).hostname.toLowerCase();
      const internalHosts = new Set([
        window.location.hostname.toLowerCase(),
        "themetainsurance.com",
        "www.themetainsurance.com",
      ]);
      if (hostname && !internalHosts.has(hostname)) referrerHost = hostname;
    } catch {
      referrerHost = null;
    }
  }

  return {
    landing_path: landingPath,
    referrer_host: referrerHost,
    utm_source: boundedQueryValue(params, "utm_source", 100),
    utm_medium: boundedQueryValue(params, "utm_medium", 100),
    utm_campaign: boundedQueryValue(params, "utm_campaign", 150),
    utm_term: boundedQueryValue(params, "utm_term", 150),
    utm_content: boundedQueryValue(params, "utm_content", 150),
  };
}

function insuranceTypeForPath(pathname: string): AnalyticsInsuranceType | null {
  if (pathname === "/travel" || pathname.startsWith("/travel/")) return "travel";
  if (pathname === "/motor" || pathname.startsWith("/motor/")) return "motor";
  if (pathname === "/property" || pathname.startsWith("/property/")) return "property";
  if (pathname === "/health" || pathname.startsWith("/health/")) return "health";
  return null;
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const sessionIdRef = useRef<string | null>(null);
  const attributionRef = useRef<AnalyticsAttribution | null>(null);
  const lastPageViewRef = useRef<string | null>(null);
  const formStartedKeysRef = useRef(new Set<string>());
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    if (
      sessionIdRef.current ||
      doNotTrackIsActive() ||
      !isAnalyticsPath(pathname)
    ) {
      return;
    }

    sessionIdRef.current = crypto.randomUUID();
    attributionRef.current = captureAttribution(pathname);
    setSessionReady(true);
  }, [pathname]);

  const sendEvent = useCallback(
    (input: {
      eventType: "page_view" | "form_started";
      insuranceType: AnalyticsInsuranceType | null;
      formMode: TrackFormStartedInput["formMode"] | null;
    }) => {
      const sessionId = sessionIdRef.current;
      const attribution = attributionRef.current;
      if (
        !sessionId ||
        !attribution ||
        doNotTrackIsActive() ||
        !isAnalyticsPath(pathname)
      ) {
        return;
      }

      void fetch("/api/analytics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        keepalive: true,
        body: JSON.stringify({
          session_id: sessionId,
          event_id: crypto.randomUUID(),
          event_type: input.eventType,
          page_path: pathname,
          insurance_type: input.insuranceType,
          form_mode: input.formMode,
          attribution,
        }),
      }).catch(() => {
        // First-party analytics is best-effort and never affects public UX.
      });
    },
    [pathname]
  );

  useEffect(() => {
    if (
      !sessionReady ||
      lastPageViewRef.current === pathname ||
      !isAnalyticsPath(pathname)
    ) {
      return;
    }
    lastPageViewRef.current = pathname;
    sendEvent({
      eventType: "page_view",
      insuranceType: insuranceTypeForPath(pathname),
      formMode: null,
    });
  }, [pathname, sendEvent, sessionReady]);

  const getAnalyticsSessionId = useCallback(() => {
    return doNotTrackIsActive() ? null : sessionIdRef.current;
  }, []);

  const trackFormStarted = useCallback(
    ({ insuranceType, formMode }: TrackFormStartedInput) => {
      const key = `${insuranceType ?? "unknown"}:${formMode}`;
      if (formStartedKeysRef.current.has(key)) return;
      formStartedKeysRef.current.add(key);
      sendEvent({
        eventType: "form_started",
        insuranceType,
        formMode,
      });
    },
    [sendEvent]
  );

  const value = useMemo(
    () => ({ getAnalyticsSessionId, trackFormStarted }),
    [getAnalyticsSessionId, trackFormStarted]
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  return useContext(AnalyticsContext);
}
