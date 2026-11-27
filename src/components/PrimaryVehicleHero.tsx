import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Vehicle } from '../types';
import { buildDueCandidates, formatDue, formatKm, pickNearestDue } from '../utils/nearestDue';

interface Props {
  vehicle: Vehicle;
  onOpen?: () => void;
  onEdit?: () => void;
  onStatistics?: () => void;
  onStartTrip?: () => void;
  onUpdateKm?: (vehicleId: number, newKm: number) => Promise<void>;
  isTracking?: boolean;
}

const RING_RADIUS = 26;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const actionClass = 'inline-flex items-center gap-1.5 rounded-md3-full bg-white/20 px-3 py-1.5 text-label-md font-semibold text-white transition-colors hover:bg-white/30';

const statusGradient: Record<string, string> = {
  good: 'from-[#1A6DFF] to-[#4C8DFF]',
  warning: 'from-[#92400E] to-[#D97706]',
  critical: 'from-[#9A3412] to-[#EA580C]',
  overdue: 'from-[#991B1B] to-[#DC2626]',
  unknown: 'from-[#475569] to-[#64748B]',
};

export function PrimaryVehicleHero({
  vehicle,
  onOpen,
  onEdit,
  onStatistics,
  onStartTrip,
  onUpdateKm,
  isTracking = false,
}: Props) {
  const [editingKm, setEditingKm] = useState(false);
  const [kmDraft, setKmDraft] = useState('');
  const [savingKm, setSavingKm] = useState(false);
  const status = vehicle.vehicle_status || 'unknown';

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

  const startEditKm = () => {
    setKmDraft(String(vehicle.current_km));
    setEditingKm(true);
  };

  const saveKm = async () => {
    const value = Number(kmDraft);
    if (!onUpdateKm || !Number.isFinite(value) || value <= vehicle.current_km) return;
    setSavingKm(true);
    try {
      await onUpdateKm(vehicle.id, Math.round(value));
      setEditingKm(false);
    } finally {
      setSavingKm(false);
    }
  };

  const hasActions = onEdit || onStatistics || onStartTrip || onUpdateKm;

  return (
    <div
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={onOpen ? (event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'Enter' || event.key === ' ') onOpen();
      } : undefined}
      className={`relative overflow-hidden rounded-md3-lg bg-gradient-to-br ${statusGradient[status] || statusGradient.unknown} p-5 text-white shadow-md3-3 transition-transform duration-200 hover:-translate-y-0.5`}
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

      {hasActions && (
        <div
          className="relative mt-4 flex flex-wrap items-center gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          {onEdit && (
            <button type="button" onClick={onEdit} className={actionClass}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
              </svg>
              Редактировать
            </button>
          )}
          {onStatistics && (
            <button type="button" onClick={onStatistics} className={actionClass}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 20V10M12 20V4M19 20v-6" />
              </svg>
              Статистика
            </button>
          )}
          {onStartTrip && !isTracking && (
            <button type="button" onClick={onStartTrip} className={actionClass}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4l13 8-13 8z" />
              </svg>
              Поездка
            </button>
          )}
          {isTracking && (
            <span className={`${actionClass} opacity-80`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
              Идёт поездка
            </span>
          )}
          {onUpdateKm && !editingKm && (
            <button type="button" onClick={startEditKm} className={actionClass}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="9" /><path d="M12 12l4-2" />
              </svg>
              Пробег
            </button>
          )}
          {onUpdateKm && editingKm && (
            <div className="flex items-center gap-2 rounded-md3-full bg-white/20 px-2 py-1">
              <input
                type="number"
                inputMode="numeric"
                value={kmDraft}
                onChange={(event) => setKmDraft(event.target.value)}
                aria-label="Новый пробег, км"
                className="w-28 rounded-md3-full border-0 bg-white px-3 py-1 text-label-md text-surface-on outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => void saveKm()}
                disabled={savingKm}
                className="rounded-md3-full bg-white px-3 py-1 text-label-sm font-semibold text-primary"
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => setEditingKm(false)}
                aria-label="Отмена"
                className="rounded-md3-full px-2 py-1 text-label-sm font-semibold text-white/90 hover:bg-white/20"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
