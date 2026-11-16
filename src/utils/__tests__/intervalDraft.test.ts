import { describe, expect, it } from 'vitest';
import type { ComponentConfig, Vehicle } from '../../types';
import { buildIntervalDraft, buildIntervalPayload, resetIntervalRow } from '../intervalDraft';

const configs: ComponentConfig[] = [
  { key: 'engine_oil', name: 'Моторное масло', example: '', default_interval: 7000, default_interval_months: 12 },
  { key: 'cabin_filter', name: 'Фильтр салона', example: '', default_interval: 15000, default_interval_months: 12 },
];

function vehicle(): Vehicle {
  return {
    id: 1,
    brand: 'VW',
    model: 'Golf',
    plate_number: 'A123AA178',
    year: 2020,
    current_km: 10000,
    is_active: true,
    intervals: { engine_oil: 9000, cabin_filter: 15000 },
    notify_flags: { engine_oil: false, cabin_filter: true },
    interval_months: { engine_oil: 6, cabin_filter: 12 },
    km_remaining: {},
    rims: [],
    tires: [],
  };
}

describe('buildIntervalDraft', () => {
  it('fills the draft from vehicle values', () => {
    const draft = buildIntervalDraft(configs, vehicle());
    expect(draft.engine_oil).toEqual({ km: '9000', months: '6', notify: false });
  });
});

describe('buildIntervalPayload', () => {
  it('returns full maps for all components', () => {
    const draft = buildIntervalDraft(configs, vehicle());
    const result = buildIntervalPayload(configs, draft);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.intervals).toEqual({ engine_oil: 9000, cabin_filter: 15000 });
    expect(result.payload.interval_months).toEqual({ engine_oil: 6, cabin_filter: 12 });
    expect(result.payload.notify_flags).toEqual({ engine_oil: false, cabin_filter: true });
  });

  it('treats empty values as defaults', () => {
    const draft = buildIntervalDraft(configs, vehicle());
    draft.engine_oil = { km: '', months: '', notify: true };
    const result = buildIntervalPayload(configs, draft);
    expect(result.ok && result.payload.intervals.engine_oil).toBe(0);
    expect(result.ok && result.payload.interval_months.engine_oil).toBeNull();
  });

  it('rejects negative values', () => {
    const draft = buildIntervalDraft(configs, vehicle());
    draft.engine_oil = { km: '-1', months: '12', notify: true };
    expect(buildIntervalPayload(configs, draft).ok).toBe(false);
  });
});

describe('resetIntervalRow', () => {
  it('resets km and months but keeps notifications', () => {
    const draft = resetIntervalRow(buildIntervalDraft(configs, vehicle()), 'engine_oil');
    expect(draft.engine_oil).toEqual({ km: '0', months: '', notify: false });
  });
});
