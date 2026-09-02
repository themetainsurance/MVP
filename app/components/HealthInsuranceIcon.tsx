import type { SVGProps } from "react";

type HealthInsuranceIconProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

export default function HealthInsuranceIcon({
  title,
  ...props
}: HealthInsuranceIconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M32 5 10 14v15c0 14.7 9.3 25.3 22 30 12.7-4.7 22-15.3 22-30V14L32 5Z"
        fill="currentColor"
        fillOpacity=".14"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="3"
      />
      <path
        d="M32 46s-14-8-14-19.1c0-4.8 3.6-8.5 8.1-8.5 2.6 0 4.7 1.2 5.9 3.3 1.2-2.1 3.3-3.3 5.9-3.3 4.5 0 8.1 3.7 8.1 8.5C46 38 32 46 32 46Z"
        fill="currentColor"
      />
      <path
        d="M21.5 31.5h6l2.5-5.4 4.2 11.4 2.7-6h5.6"
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.7"
      />
    </svg>
  );
}
