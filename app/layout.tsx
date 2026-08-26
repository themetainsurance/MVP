import type { Metadata } from "next";
import { AnalyticsProvider } from "./components/AnalyticsProvider";

const siteName = "The Meta Insurance";
const siteUrl = "https://www.themetainsurance.com";
const siteDescription =
  "Compare insurance information for travel, motor and property cover. The Meta Insurance provides educational content and referral tools to licensed insurance providers.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: "The Meta Insurance | Travel, Motor & Property Insurance",

  description: siteDescription,

  alternates: {
    canonical: "/",
  },

  applicationName: siteName,

  keywords: [
    "insurance",
    "insurance comparison",
    "travel insurance",
    "motor insurance",
    "property insurance",
    "compare insurance",
    "insurance coverage",
    "insurance guides",
  ],

  creator: siteName,
  publisher: siteName,

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    siteName,
    url: "/",
    title: "The Meta Insurance | Travel, Motor & Property Insurance",
    description: siteDescription,
  },

  twitter: {
    card: "summary",
    title: "The Meta Insurance | Travel, Motor & Property Insurance",
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "Arial, Helvetica, sans-serif",
          backgroundColor: "#ffffff",
          color: "#111827",
        }}
      >
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
