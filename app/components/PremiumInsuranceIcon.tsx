import type { SVGProps } from "react";
import HealthInsuranceIcon from "./HealthInsuranceIcon";

export type PremiumInsuranceIconKind =
  | "travel"
  | "motor"
  | "property"
  | "health"
  | "assistant";

type PremiumInsuranceIconProps = SVGProps<SVGSVGElement> & {
  kind: PremiumInsuranceIconKind;
  title?: string;
};

export default function PremiumInsuranceIcon({
  kind,
  title,
  ...props
}: PremiumInsuranceIconProps) {
  if (kind === "health") {
    return <HealthInsuranceIcon title={title} {...props} />;
  }

  const accessibility = {
    role: title ? "img" : undefined,
    "aria-hidden": title ? undefined : (true as const),
    "aria-label": title,
  };

  if (kind === "travel") {
    return (
      <svg viewBox="0 0 64 64" focusable="false" {...accessibility} {...props}>
        {title ? <title>{title}</title> : null}
        <circle cx="32" cy="32" r="25" fill="currentColor" fillOpacity=".13" stroke="currentColor" strokeWidth="2.5" />
        <path d="M12 34.5c9-4.5 20-7.7 39.5-8.7M16 45c9.2 2.6 19.5 2.3 30-1" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity=".5" />
        <path d="m47.8 17.8-8.9 18.6 7.2 7.4-3.2 2.3-8.8-5-7 10.2-2.9-1.7 4-12.2-10-6 2.2-3 10.7 3.1 11.6-16.2c1.7-2.4 7.3-1.4 5.1 2.8Z" fill="currentColor" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" />
      </svg>
    );
  }

  if (kind === "motor") {
    return (
      <svg viewBox="0 0 64 64" focusable="false" {...accessibility} {...props}>
        {title ? <title>{title}</title> : null}
        <path d="M32 5 10 14v15c0 14.7 9.3 25.3 22 30 12.7-4.7 22-15.3 22-30V14L32 5Z" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.7" />
        <path d="m18.5 36.5 3.7-10.2c.7-2 2.6-3.3 4.7-3.3h10.2c2.1 0 4 1.3 4.7 3.3l3.7 10.2v8h-5v-3h-17v3h-5v-8Z" fill="currentColor" />
        <path d="M23 34h18l-2.2-6.4a2 2 0 0 0-1.9-1.4h-9.8a2 2 0 0 0-1.9 1.4L23 34Z" fill="#fff" opacity=".95" />
        <circle cx="24.5" cy="38" r="2" fill="#fff" />
        <circle cx="39.5" cy="38" r="2" fill="#fff" />
      </svg>
    );
  }

  if (kind === "property") {
    return (
      <svg viewBox="0 0 64 64" focusable="false" {...accessibility} {...props}>
        {title ? <title>{title}</title> : null}
        <path d="M32 5 10 14v15c0 14.7 9.3 25.3 22 30 12.7-4.7 22-15.3 22-30V14L32 5Z" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.7" />
        <path d="m17 31 15-12 15 12-3.5 4.2L42 34v12H22V34l-1.5 1.2L17 31Z" fill="currentColor" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M29 46V35h6v11" fill="none" stroke="#fff" strokeLinejoin="round" strokeWidth="2.5" />
        <path d="M26 31h12" fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="2.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" focusable="false" {...accessibility} {...props}>
      {title ? <title>{title}</title> : null}
      <circle cx="32" cy="32" r="25" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="2.5" />
      <path d="M32 13c1.7 9.5 8.2 16 17.8 17.8C40.2 32.5 33.7 39 32 48.6 30.3 39 23.8 32.5 14.2 30.8 23.8 29 30.3 22.5 32 13Z" fill="currentColor" />
      <circle cx="48.5" cy="16.5" r="3.5" fill="currentColor" opacity=".7" />
      <circle cx="16" cy="47" r="2.5" fill="currentColor" opacity=".55" />
    </svg>
  );
}
