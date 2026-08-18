import type { Metadata } from "next";

const siteName = "The Meta Insurance";
const siteUrl = "https://www.themetainsurance.com";
const siteDescription =
  "Compare travel, motor and property insurance, understand coverage differences and submit your insurance request to relevant licensed insurance partners.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: "The Meta Insurance | Travel, Motor & Property Insurance",

  description: siteDescription,

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
        {children}
      </body>
    </html>
  );
}
