export interface TabItem<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className = '',
  ariaLabel,
}: Props<T>) {
  return (
    <div
      className={`flex flex-wrap gap-2 bg-surface-variant/50 p-1 rounded-md3-md ${className}`}
      role="tablist"
      aria-label={ariaLabel}
    >
      {items.map(item => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          role="tab"
          aria-selected={value === item.value}
          className={`px-4 py-2 rounded-md3-sm text-label-lg transition-all duration-200 ${
            value === item.value
              ? 'bg-surface shadow-md3-1 text-primary'
              : 'text-surface-on-variant hover:bg-surface-variant/50'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
