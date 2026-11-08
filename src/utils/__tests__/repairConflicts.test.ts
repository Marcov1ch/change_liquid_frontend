import { describe, expect, it } from 'vitest';
import type { Repair, Replacement } from '../../types';
import { findBlockingRepair, hasPricedReplacement, isPricedReplacement } from '../repairConflicts';

function repair(componentTypes: string[], repairDate = '2026-05-10'): Repair {
  return {
    id: 1,
    vehicle_id: 1,
    repair_date: repairDate,
    km_at_repair: 10000,
    description: null,
    work_cost: 2000,
    parts_cost: 3000,
    component_types: componentTypes,
  };
}

function replacement(
  componentType: string,
  componentPrice: number | null,
  workPrice: number | null,
  replacementDate = '2026-05-10',
  sourceRepairId: number | null = null,
): Replacement {
  return {
    id: 1,
    vehicle_id: 1,
    component_type: componentType,
    component_name: 'Тест',
    component_price: componentPrice,
    work_price: workPrice,
    replacement_date: replacementDate,
    km_at_replacement: 10000,
    interval_km: 7000,
    source_repair_id: sourceRepairId,
  };
}

describe('repairConflicts', () => {
  it('finds a repair on the same date and component', () => {
    const result = findBlockingRepair([repair(['engine_oil'])], '2026-05-10', 'engine_oil');
    expect(result?.id).toBe(1);
  });

  it('ignores repairs on other dates or components', () => {
    expect(findBlockingRepair([repair(['engine_oil'])], '2026-05-11', 'engine_oil')).toBeNull();
    expect(findBlockingRepair([repair(['engine_oil'])], '2026-05-10', 'coolant')).toBeNull();
  });

  it('detects priced replacements', () => {
    expect(isPricedReplacement(replacement('engine_oil', 1000, 0))).toBe(true);
    expect(isPricedReplacement(replacement('engine_oil', 0, 500))).toBe(true);
    expect(isPricedReplacement(replacement('engine_oil', 0, 0))).toBe(false);
  });

  it('ignores the repair being edited', () => {
    const items = [replacement('engine_oil', 1000, 0, '2026-05-10', 5)];
    expect(hasPricedReplacement(items, '2026-05-10', 'engine_oil')).toBe(true);
    expect(hasPricedReplacement(items, '2026-05-10', 'engine_oil', 5)).toBe(false);
  });
});
