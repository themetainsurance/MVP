import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Health Insurance | The Meta Insurance",
  description:
    "Review health insurance information or upload an existing policy to request options from relevant licensed insurance providers or partners.",
  alternates: { canonical: "/health" },
  openGraph: {
    title: "Health Insurance | The Meta Insurance",
    description:
      "Review health insurance information or upload an existing policy to request options from relevant licensed insurance providers or partners.",
    url: "/health",
    type: "website",
  },
};

export default function HealthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
