import type { ComponentConfig, Vehicle } from '../types';

export interface IntervalDraftRow {
  km: string;
  months: string;
  notify: boolean;
}

export type IntervalDraft = Record<string, IntervalDraftRow>;

export interface IntervalPayload {
  intervals: Record<string, number>;
  interval_months: Record<string, number | null>;
  notify_flags: Record<string, boolean>;
}

export function buildIntervalDraft(configs: ComponentConfig[], vehicle: Vehicle): IntervalDraft {
  return Object.fromEntries(configs.map(config => [
    config.key,
    {
      km: String(vehicle.intervals[config.key] ?? config.default_interval),
      months: vehicle.interval_months[config.key] == null
        ? ''
        : String(vehicle.interval_months[config.key]),
      notify: vehicle.notify_flags[config.key] ?? true,
    },
  ]));
}

export function resetIntervalRow(draft: IntervalDraft, key: string): IntervalDraft {
  return {
    ...draft,
    [key]: {
      ...(draft[key] ?? { notify: true }),
      km: '0',
      months: '',
    },
  };
}

export function buildIntervalPayload(
  configs: ComponentConfig[],
  draft: IntervalDraft,
): { ok: true; payload: IntervalPayload } | { ok: false; error: string } {
  const intervals: Record<string, number> = {};
  const intervalMonths: Record<string, number | null> = {};
  const notifyFlags: Record<string, boolean> = {};

  for (const config of configs) {
    const row = draft[config.key];
    const kmRaw = row?.km.trim() ?? '';
    const monthsRaw = row?.months.trim() ?? '';

    const km = kmRaw === '' ? 0 : Number(kmRaw);
    if (!Number.isFinite(km) || km < 0) {
      return { ok: false, error: `Некорректный интервал для «${config.name}»` };
    }

    const months = monthsRaw === '' ? null : Number(monthsRaw);
    if (months !== null && (!Number.isFinite(months) || months < 0)) {
      return { ok: false, error: `Некорректный срок для «${config.name}»` };
    }

    intervals[config.key] = Math.round(km);
    intervalMonths[config.key] = months === null ? null : Math.round(months);
    notifyFlags[config.key] = row?.notify ?? true;
  }

  return {
    ok: true,
    payload: {
      intervals,
      interval_months: intervalMonths,
      notify_flags: notifyFlags,
    },
  };
}
