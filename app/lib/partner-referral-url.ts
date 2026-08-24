export function buildPartnerReferralUrl(
  destinationUrl: string,
  trackingParameterName: string | null,
  clickReference: string
) {
  const url = new URL(destinationUrl);
  if (trackingParameterName) {
    url.searchParams.set(trackingParameterName, clickReference);
  }
  return url.toString();
}
