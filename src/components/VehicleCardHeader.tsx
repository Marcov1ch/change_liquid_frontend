import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Vehicle } from '../types';

interface Props {
  vehicle: Vehicle;
  title: string;
  onClose: () => void;
  onShare: () => void;
}

export function VehicleCardHeader({ vehicle, title, onClose, onShare }: Props) {
  const { data: shareLink } = useQuery({
    queryKey: ['share', vehicle.id],
    queryFn: () => api.getShareLink(vehicle.id),
    staleTime: 30_000,
  });
  const isShareActive = shareLink?.enabled === true;

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-surface-variant/50 border-b border-outline-variant">
      <div className="flex items-center gap-3 min-w-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#44474E" strokeWidth="1.5" strokeLinecap="round" className="shrink-0">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
        </svg>
        <span className="text-title-sm text-surface-on truncate">{title}</span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onShare}
          title={isShareActive ? 'Ссылка активна' : 'Поделиться историей'}
          aria-label={isShareActive ? 'Поделиться историей (ссылка активна)' : 'Поделиться историей'}
          className={`relative flex items-center justify-center w-8 h-8 rounded-md3-full transition-colors ${
            isShareActive
              ? 'bg-primary-container text-primary-on-container hover:bg-primary-container/80'
              : 'text-surface-on-variant hover:bg-surface-variant'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20v.01" />
          </svg>
          {isShareActive && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#28A745] ring-2 ring-surface" />
          )}
        </button>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded-md3-full text-surface-on-variant hover:bg-surface-variant transition-colors"
          aria-label="Закрыть"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
