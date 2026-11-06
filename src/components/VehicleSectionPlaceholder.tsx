import type { Vehicle } from '../types';

interface Props {
  vehicle: Vehicle;
  title: string;
  description: string;
  icon: string;
  onClose: () => void;
}

export function VehicleSectionPlaceholder({ vehicle, title, description, icon, onClose }: Props) {
  return (
    <div className="md3-card overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-surface-variant/50 border-b border-outline-variant">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg shrink-0" aria-hidden="true">{icon}</span>
          <span className="text-title-sm text-surface-on truncate">
            {title}: {vehicle.brand} {vehicle.model}
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded-md3-full text-surface-on-variant hover:bg-surface-variant transition-colors shrink-0"
          aria-label="Закрыть"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center text-xl" aria-hidden="true">
          {icon}
        </div>
        <p className="text-title-sm text-surface-on mb-1">Раздел в разработке</p>
        <p className="text-body-md text-outline max-w-sm">{description}</p>
      </div>
    </div>
  );
}
