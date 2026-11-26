import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Vehicle } from '../types';
import { buildDueCandidates, formatDue, formatKm, pickNearestDue } from '../utils/nearestDue';

interface Props {
  vehicle: Vehicle;
  onOpen?: () => void;
}

const RING_RADIUS = 26;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function PrimaryVehicleHero({ vehicle, onOpen }: Props) {
  const { data: replacements = [] } = useQuery({
    queryKey: ['replacements', vehicle.id],
    queryFn: () => api.getReplacements(vehicle.id),
    staleTime: 30_000,
  });

  const { data: tireSets = [] } = useQuery({
    queryKey: ['tire-sets', vehicle.id],
    queryFn: () => api.getTireSets(vehicle.id),
    staleTime: 30_000,
  });

  const nearest = useMemo(
    () => pickNearestDue(buildDueCandidates(vehicle, replacements, tireSets)),
    [vehicle, replacements, tireSets],
  );

  const progress = nearest ? Math.min(100, Math.max(4, Math.round((1 - nearest.ratio) * 100))) : 0;
  const dash = (progress / 100) * RING_CIRCUMFERENCE;

  return (
    <div
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={onOpen ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') onOpen();
      } : undefined}
      className="relative overflow-hidden rounded-md3-lg bg-gradient-to-br from-[#1A6DFF] to-[#4C8DFF] p-5 text-white shadow-md3-3 transition-transform duration-200 hover:-translate-y-0.5"
    >
      <span className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" aria-hidden="true" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <p className="m-0 truncate text-title-lg">{vehicle.brand} {vehicle.model}</p>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md3-full bg-white/20 px-2 py-0.5 text-label-sm">
              ★ основное
            </span>
          </div>
          <p className="m-0 mt-0.5 text-label-md text-white/80">{vehicle.plate_number}</p>

          <p className="m-0 mt-3 text-headline-md sm:text-headline-lg">{formatKm(vehicle.current_km)} км</p>
          <p className="m-0 mt-1 text-body-sm text-white/90">
            {nearest ? `${nearest.componentName} · ${formatDue(nearest)}` : 'Нет данных о заменах'}
          </p>

          {nearest && (
            <div className="mt-3 h-1.5 max-w-md overflow-hidden rounded-md3-full bg-white/25">
              <div className="h-full rounded-md3-full bg-white" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>

        {nearest && (
          <div className="relative h-[72px] w-[72px] shrink-0">
            <svg width="72" height="72" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="5" />
              <circle
                cx="30"
                cy="30"
                r={RING_RADIUS}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${RING_CIRCUMFERENCE}`}
                transform="rotate(-90 30 30)"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-label-md font-bold">{progress}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
