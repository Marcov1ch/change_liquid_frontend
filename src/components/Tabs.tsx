import type { ReactNode } from 'react';

export interface TabItem<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface Props<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
  iconOnlyMobile?: boolean;
  stretch?: boolean;
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className = '',
  ariaLabel,
  iconOnlyMobile = false,
  stretch = false,
}: Props<T>) {
  return (
    <div
      className={`flex gap-2 bg-surface-variant/50 p-1 rounded-md3-md ${
        stretch ? 'flex-nowrap' : 'flex-wrap'
      } ${className}`}
      role="tablist"
      aria-label={ariaLabel}
    >
      {items.map(item => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          role="tab"
          aria-selected={value === item.value}
          aria-label={item.label}
          title={item.label}
          className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 min-h-[44px] min-w-[44px] rounded-md3-sm text-label-lg transition-all duration-200 ${
            stretch ? 'flex-1 sm:flex-none' : ''
          } ${
            value === item.value
              ? 'bg-surface shadow-md3-1 text-primary'
              : 'text-surface-on-variant hover:bg-surface-variant/50'
          }`}
        >
          {item.icon && (
            <span className="shrink-0" aria-hidden="true">
              {item.icon}
            </span>
          )}
          <span className={iconOnlyMobile ? 'hidden sm:inline' : ''}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}
