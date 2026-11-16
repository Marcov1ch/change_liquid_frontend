import type { ReactNode } from 'react';
import { Sheet } from './Sheet';

export interface ActionSheetItem {
  id: string;
  label: string;
  icon: ReactNode;
  selected?: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  items: ActionSheetItem[];
  onSelect: (id: string) => void;
}

export function ActionSheet({ isOpen, onClose, title, description, items, onSelect }: Props) {
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col pb-2">
        {description && (
          <p className="text-body-sm text-surface-on-variant m-0 px-2 pb-2">{description}</p>
        )}
        {items.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`flex items-center gap-3 min-h-[56px] px-2 rounded-md3-sm text-left transition-colors ${
              item.selected ? 'bg-primary-container text-primary-on-container' : 'hover:bg-surface-variant'
            }`}
          >
            <span className={`flex items-center justify-center w-10 h-10 rounded-md3-sm ${
              item.selected ? 'bg-primary/15' : 'bg-surface-variant text-surface-on-variant'
            }`}>
              {item.icon}
            </span>
            <span className="flex-1 text-body-md font-medium">{item.label}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </Sheet>
  );
}
