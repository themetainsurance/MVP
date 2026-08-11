import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Meta Insurance",
  description:
    "Compare travel, motor and property insurance with The Meta Insurance.",
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
