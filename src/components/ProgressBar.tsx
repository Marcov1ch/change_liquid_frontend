interface ProgressBarProps {
  value: number;
  status?: string;
  height?: string;
  showLabel?: boolean;
}

const fillColors: Record<string, string> = {
  good: 'bg-[#28A745]',
  warning: 'bg-[#FFC107]',
  critical: 'bg-[#E06900]',
  overdue: 'bg-error',
  replaced: 'bg-outline-variant',
  unknown: 'bg-outline-variant',
};

const textColors: Record<string, string> = {
  good: 'text-[#1B5E1B]',
  warning: 'text-[#7A6100]',
  critical: 'text-[#7A2D00]',
  overdue: 'text-error-on-container',
  unknown: 'text-outline',
};

export function ProgressBar({ value, status = 'unknown', height = '6px', showLabel = true }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const fillClass = fillColors[status] || fillColors.unknown;
  const textClass = textColors[status] || textColors.unknown;

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 rounded-full bg-outline-variant/50" style={{ height }}>
        <div
          className={`rounded-full transition-all duration-500 ease-out ${fillClass}`}
          style={{ width: `${clamped}%`, height: '100%' }}
        />
      </div>
      {showLabel && (
        <span className={`text-label-sm tabular-nums shrink-0 ${textClass}`}>
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
