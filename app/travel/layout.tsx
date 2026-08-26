import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Travel Insurance | The Meta Insurance",
  description:
    "Enter your travel details to request insurance options from relevant licensed insurance providers or partners.",

  alternates: {
    canonical: "/travel",
  },

  openGraph: {
    title: "Travel Insurance | The Meta Insurance",
    description:
      "Enter your travel details to request insurance options from relevant licensed insurance providers or partners.",
    url: "/travel",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Travel Insurance | The Meta Insurance",
    description:
      "Request travel insurance information from relevant licensed insurance providers or partners.",
  },
};

export default function TravelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
