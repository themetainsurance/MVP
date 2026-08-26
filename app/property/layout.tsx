import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Property Insurance | The Meta Insurance",
  description:
    "Review property insurance information or upload an existing policy to request options from relevant licensed insurance providers or partners.",

  alternates: {
    canonical: "/property",
  },

  openGraph: {
    title: "Property Insurance | The Meta Insurance",
    description:
      "Review property insurance information or upload an existing policy to request options from relevant licensed insurance providers or partners.",
    url: "/property",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Property Insurance | The Meta Insurance",
    description:
      "Request property insurance information from relevant licensed insurance providers or partners.",
  },
};

export default function PropertyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
