import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Motor Insurance | The Meta Insurance",
  description:
    "Review motor insurance information or upload an existing policy to request options from relevant licensed insurance providers or partners.",

  alternates: {
    canonical: "/motor",
  },

  openGraph: {
    title: "Motor Insurance | The Meta Insurance",
    description:
      "Review motor insurance information or upload an existing policy to request options from relevant licensed insurance providers or partners.",
    url: "/motor",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Motor Insurance | The Meta Insurance",
    description:
      "Request motor insurance information from relevant licensed insurance providers or partners.",
  },
};

export default function MotorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
