interface Props {
  className?: string;
}

export function EmptyGarageIllustration({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 160 110" fill="none" aria-hidden="true">
      <ellipse cx="80" cy="98" rx="54" ry="7" className="fill-primary" opacity="0.08" />
      <path
        d="M30 78c0-9 7-16 16-16h9l11-16c3-4 7-6 12-6h20c5 0 9 2 12 6l11 16h9c9 0 16 7 16 16"
        className="stroke-primary"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path d="M30 78h116" className="stroke-primary" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="56" cy="80" r="9" className="fill-surface stroke-primary" strokeWidth="2.6" />
      <circle cx="120" cy="80" r="9" className="fill-surface stroke-primary" strokeWidth="2.6" />
      <path d="M66 74h44" className="stroke-primary-container" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M74 22c-4 6-7 9-7 13a7 7 0 0 0 14 0c0-4-3-7-7-13z"
        className="fill-primary-container stroke-primary"
        strokeWidth="2"
      />
      <circle cx="112" cy="26" r="3" className="fill-primary" opacity="0.35" />
      <circle cx="122" cy="38" r="2" className="fill-primary" opacity="0.25" />
    </svg>
  );
}
