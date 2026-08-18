import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Motor Insurance | The Meta Insurance",
  description:
    "Enter your vehicle details or upload an existing motor insurance policy and submit your request to relevant licensed insurance partners.",

  alternates: {
    canonical: "/motor",
  },

  openGraph: {
    title: "Motor Insurance | The Meta Insurance",
    description:
      "Enter your vehicle details or upload an existing motor insurance policy and submit your request to relevant licensed insurance partners.",
    url: "/motor",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Motor Insurance | The Meta Insurance",
    description:
      "Submit your motor insurance requirements to relevant licensed insurance partners.",
  },
};

export default function MotorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
