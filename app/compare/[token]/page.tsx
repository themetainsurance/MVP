import type { Metadata } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import PolicyComparisonView from "../../components/PolicyComparisonView";
import { createPublicComparisonReferralCtas, loadPublicComparisonSnapshot } from "../../lib/comparison-public-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Insurance policy comparison | The Meta Insurance",
  description: "A factual insurance policy comparison shared through The Meta Insurance.",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
  openGraph: {
    title: "Insurance policy comparison | The Meta Insurance",
    description: "A factual insurance policy comparison shared through The Meta Insurance.",
    url: "https://www.themetainsurance.com",
    siteName: "The Meta Insurance",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Insurance policy comparison | The Meta Insurance",
    description: "A factual insurance policy comparison shared through The Meta Insurance.",
  },
  other: { robots: "noindex, nofollow, noarchive" },
};

export default async function PublicComparisonPage({ params }: { params: Promise<{ token: string }> }) {
  noStore();
  const { token } = await params;
  const publicData = await loadPublicComparisonSnapshot(token);
  if (!publicData) {
    return (
      <main style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: "32px" }}>
        <section style={{ maxWidth: 620, textAlign: "center" }}>
          <h1>Comparison unavailable</h1>
          <p>This comparison link is unavailable or has expired.</p>
          <Link href="/">Return to The Meta Insurance</Link>
        </section>
      </main>
    );
  }
  const referralCtas = await createPublicComparisonReferralCtas(publicData);
  return <PolicyComparisonView snapshot={publicData.snapshot} referralCtas={referralCtas} />;
}
