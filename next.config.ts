import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const noReferrerHeader = {
  key: "Referrer-Policy",
  value: "no-referrer",
};

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/compare/:path*",
        headers: [noReferrerHeader],
      },
      {
        source: "/go/:path*",
        headers: [noReferrerHeader],
      },
    ];
  },
};

export default nextConfig;
