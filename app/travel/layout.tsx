import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Travel Insurance | The Meta Insurance",
  description:
    "Submit your travel insurance requirements, including destination, travel dates, travellers and coverage preferences, to relevant licensed insurance partners.",

  alternates: {
    canonical: "/travel",
  },

  openGraph: {
    title: "Travel Insurance | The Meta Insurance",
    description:
      "Submit your travel insurance requirements, including destination, travel dates, travellers and coverage preferences, to relevant licensed insurance partners.",
    url: "/travel",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Travel Insurance | The Meta Insurance",
    description:
      "Submit your travel insurance requirements to relevant licensed insurance partners.",
  },
};

export default function TravelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
