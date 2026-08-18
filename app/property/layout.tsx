import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Property Insurance | The Meta Insurance",
  description:
    "Enter your property details or upload an existing property insurance policy and submit your request to relevant licensed insurance partners.",

  alternates: {
    canonical: "/property",
  },

  openGraph: {
    title: "Property Insurance | The Meta Insurance",
    description:
      "Enter your property details or upload an existing property insurance policy and submit your request to relevant licensed insurance partners.",
    url: "/property",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Property Insurance | The Meta Insurance",
    description:
      "Submit your property insurance requirements to relevant licensed insurance partners.",
  },
};

export default function PropertyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
