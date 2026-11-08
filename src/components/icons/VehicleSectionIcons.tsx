interface IconProps {
  className?: string;
}

const DEFAULT_CLASS = 'w-5 h-5 sm:w-[22px] sm:h-[22px]';

export function ReplacementsIcon({ className = DEFAULT_CLASS }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3s6 6.5 6 10a6 6 0 0 1-12 0c0-3.5 6-10 6-10z" />
      <path d="M9 13a3 3 0 0 0 3 3" />
    </svg>
  );
}

export function FuelIcon({ className = DEFAULT_CLASS }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
      <path d="M4 11h10" />
      <path d="M14 7h2l3 3v8a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-5h-1" />
      <path d="M3 21h12" />
    </svg>
  );
}

export function RepairIcon({ className = DEFAULT_CLASS }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M14.5 6.5a4.5 4.5 0 0 0-5.9 5.9L4 17l3 3 4.6-4.6a4.5 4.5 0 0 0 5.9-5.9l-2.8 2.8-2.5-2.5 2.3-2.3z" />
    </svg>
  );
}

export function ExpensesIcon({ className = DEFAULT_CLASS }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
      <path d="M9 7h6M9 11h6M9 15h4" />
    </svg>
  );
}

export function StatisticsIcon({ className = DEFAULT_CLASS }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 20V13M10 20V7M16 20v-4M22 20H2" />
    </svg>
  );
}
