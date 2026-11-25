import { describe, expect, it } from 'vitest';
import type { NewReplacementData } from '../../components/AddReplacementForm';
import { buildReplacementPayload, validateKmUpdate } from '../quickAdd';

const base: NewReplacementData = {
  component_type: 'engine_oil',
  component_name: 'Mobil 1',
  component_price: '2500',
  work_price: '500',
  replacement_date: '2026-11-16',
  km_at_replacement: 100000,
  next_change_date: '',
  currency: 'RUB',
};

describe('buildReplacementPayload', () => {
  it('builds a regular replacement payload', () => {
    expect(buildReplacementPayload(base, null)).toEqual({
      ok: true,
      payload: {
        component_type: 'engine_oil',
        component_name: 'Mobil 1',
        replacement_date: '2026-11-16',
        km_at_replacement: 100000,
        component_price: 2500,
        work_price: 500,
      },
    });
  });

  it('requires next_change_date for date-only components', () => {
    expect(buildReplacementPayload({ ...base, component_type: 'insurance', next_change_date: '' }, null))
      .toEqual({ ok: false, error: 'Укажите дату окончания' });
  });
});

describe('validateKmUpdate', () => {
  it('requires a number above the current km', () => {
    expect(validateKmUpdate(100, '90')).toEqual({ ok: false, error: 'Пробег должен быть больше текущего' });
    expect(validateKmUpdate(100, '120')).toEqual({ ok: true, newKm: 120 });
    expect(validateKmUpdate(100, 'abc').ok).toBe(false);
  });
});
