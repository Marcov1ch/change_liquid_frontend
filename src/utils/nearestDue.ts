import type { Replacement, TireSet, Vehicle } from '../types';

export interface DueCandidate {
  componentType: string;
  componentName: string;
  status: string;
  kmRemaining: number | null;
  daysRemaining: number | null;
  intervalKm: number | null;
  intervalMonths: number | null;
  dueDate: string | null;
}

export interface NearestDue {
  componentName: string;
  kind: 'km' | 'date';
  status: string;
  kmRemaining: number | null;
  dueDate: string | null;
  ratio: number;
}

export function formatKm(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function buildDueCandidates(
  vehicle: Vehicle,
  replacements: Replacement[],
  tireSets: TireSet[] = [],
): DueCandidate[] {
  const byType = new Map<string, Replacement>();
  for (const replacement of replacements) {
    if (replacement.status === 'replaced') continue;
    byType.set(replacement.component_type, replacement);
  }

  const candidates: DueCandidate[] = [];
  for (const replacement of byType.values()) {
    const intervalKm = vehicle.intervals[replacement.component_type] ?? replacement.interval_km ?? null;
    const intervalMonths = vehicle.interval_months[replacement.component_type] ?? null;
    if (replacement.km_remaining != null && intervalKm != null && intervalKm > 0) {
      candidates.push({
        componentType: replacement.component_type,
        componentName: replacement.component_name,
        status: replacement.status ?? 'unknown',
        kmRemaining: replacement.km_remaining,
        daysRemaining: null,
        intervalKm,
        intervalMonths,
        dueDate: null,
      });
    } else if (replacement.next_change_date != null && replacement.days_remaining != null) {
      candidates.push({
        componentType: replacement.component_type,
        componentName: replacement.component_name,
        status: replacement.status ?? 'unknown',
        kmRemaining: null,
        daysRemaining: replacement.days_remaining,
        intervalKm,
        intervalMonths,
        dueDate: replacement.next_change_date,
      });
    }
  }

  const installed = tireSets.find(item => item.is_installed);
  if (installed?.next_change_date && installed.days_remaining != null && !byType.has('tire_change')) {
    candidates.push({
      componentType: 'tire_change',
      componentName: installed.name,
      status: installed.status ?? 'unknown',
      kmRemaining: null,
      daysRemaining: installed.days_remaining,
      intervalKm: null,
      intervalMonths: 60,
      dueDate: installed.next_change_date,
    });
  }

  return candidates;
}

export function pickNearestDue(candidates: DueCandidate[]): NearestDue | null {
  let best: NearestDue | null = null;
  let bestAbs = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    if (candidate.status === 'replaced') continue;
    const isKm = candidate.kmRemaining != null;
    const ratio = isKm
      ? (candidate.kmRemaining as number) / (candidate.intervalKm ?? 1)
      : (candidate.daysRemaining as number) / ((candidate.intervalMonths ?? 12) * 30);
    const abs = isKm ? Math.abs(candidate.kmRemaining as number) : Math.abs(candidate.daysRemaining as number);

    const current: NearestDue = {
      componentName: candidate.componentName,
      kind: isKm ? 'km' : 'date',
      status: candidate.status,
      kmRemaining: candidate.kmRemaining,
      dueDate: candidate.dueDate,
      ratio,
    };

    if (!best) {
      best = current;
      bestAbs = abs;
      continue;
    }

    if (ratio < best.ratio) {
      best = current;
      bestAbs = abs;
    } else if (ratio === best.ratio) {
      if (best.kind === 'date' && isKm) {
        best = current;
        bestAbs = abs;
      } else if (best.kind === 'km' && abs < bestAbs) {
        best = current;
        bestAbs = abs;
      }
    }
  }

  return best;
}

export function formatDue(nearest: NearestDue): string {
  if (nearest.kind === 'km') {
    return `Осталось ${formatKm(nearest.kmRemaining ?? 0)} км`;
  }
  if (!nearest.dueDate) return 'Дата не указана';
  const [, month, day] = nearest.dueDate.split('-');
  return `До ${day}.${month}`;
}
