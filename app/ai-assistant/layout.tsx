import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Insurance Assistant | The Meta Insurance",
  description:
    "Use The Meta Insurance assistant to organise information, understand insurance categories and prepare a Travel, Motor or Property insurance request.",

  alternates: {
    canonical: "/ai-assistant",
  },

  openGraph: {
    title: "AI Insurance Assistant | The Meta Insurance",
    description:
      "Organise information and prepare a Travel, Motor or Property insurance request with The Meta Insurance assistant.",
    url: "/ai-assistant",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "AI Insurance Assistant | The Meta Insurance",
    description:
      "Organise information and prepare a Travel, Motor or Property insurance request.",
  },
};

export default function AIAssistantLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
