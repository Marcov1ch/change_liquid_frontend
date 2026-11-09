import { describe, expect, it } from 'vitest';
import type {
  PublicFuelRecord,
  PublicOtherExpense,
  PublicRepair,
  PublicReplacement,
} from '../../types';
import { buildVehicleStatistics } from '../statistics';

function replacement(
  replacementDate: string,
  componentPrice: number | null,
  workPrice: number | null,
  componentType = 'engine_oil',
): PublicReplacement {
  return {
    id: 1,
    component_type: componentType,
    component_name: componentType === 'tire_change' ? 'Шины' : 'Масло',
    component_price: componentPrice,
    work_price: workPrice,
    replacement_date: replacementDate,
    km_at_replacement: 10000,
    interval_km: 7000,
  };
}

function repair(repairDate: string, workCost: number, partsCost: number): PublicRepair {
  return {
    id: 1,
    repair_date: repairDate,
    km_at_repair: 10000,
    description: null,
    work_cost: workCost,
    parts_cost: partsCost,
    component_types: ['engine_oil'],
  };
}

function fuel(fuelDate: string, totalCost: number): PublicFuelRecord {
  return {
    id: 1,
    fuel_date: fuelDate,
    km_at_fuel: 10000,
    liters: 35.5,
    total_cost: totalCost,
    consumption_l_per_100km: 7.1,
  };
}

function expense(expenseDate: string, amount: number): PublicOtherExpense {
  return {
    id: 1,
    name: 'Штраф',
    expense_date: expenseDate,
    amount,
  };
}

describe('buildVehicleStatistics', () => {
  const replacements = [
    replacement('2026-01-01', 5000, 1000),
    replacement('2026-02-15', 30000, 1500, 'tire_change'),
    replacement('2026-12-31', 2000, 0),
    replacement('2025-06-15', 1000, 0),
  ];
  const repairs = [repair('2026-03-10', 1000, 2000)];
  const fuelRecords = [fuel('2026-01-20', 2500)];
  const otherExpenses = [expense('2026-12-05', 500)];

  it('groups costs by month and category', () => {
    const stats = buildVehicleStatistics(replacements, repairs, fuelRecords, otherExpenses, 2026);

    expect(stats.months).toHaveLength(12);
    expect(stats.months[0]).toMatchObject({
      month: 1,
      replacements: 6000,
      tires: 0,
      repairs: 0,
      fuel: 2500,
      other_expenses: 0,
      total: 8500,
    });
    expect(stats.months[1]).toMatchObject({
      month: 2,
      replacements: 0,
      tires: 31500,
      total: 31500,
    });
    expect(stats.months[2]).toMatchObject({ month: 3, repairs: 3000, total: 3000 });
    expect(stats.months[11]).toMatchObject({
      month: 12,
      replacements: 2000,
      other_expenses: 500,
      total: 2500,
    });
  });

  it('calculates yearly totals', () => {
    const stats = buildVehicleStatistics(replacements, repairs, fuelRecords, otherExpenses, 2026);

    expect(stats.totals).toEqual({
      replacements: 8000,
      tires: 31500,
      repairs: 3000,
      fuel: 2500,
      other_expenses: 500,
      total: 45500,
    });
    expect(stats.max_monthly_total).toBe(31500);
  });

  it('returns empty months for a year without records', () => {
    const stats = buildVehicleStatistics(replacements, repairs, fuelRecords, otherExpenses, 2024);

    expect(stats.totals.total).toBe(0);
    expect(stats.months.every(month => month.total === 0)).toBe(true);
  });

  it('exposes available years across all categories', () => {
    const stats = buildVehicleStatistics(replacements, repairs, fuelRecords, otherExpenses, 2026);

    expect(stats.available_years).toContain(2025);
    expect(stats.available_years).toContain(2026);
  });

  it('parses dates without timezone shifts', () => {
    const stats = buildVehicleStatistics(
      [replacement('2026-01-01', 1000, 0)],
      [],
      [],
      [],
      2026,
    );

    expect(stats.months[0].replacements).toBe(1000);
    expect(stats.months[11].replacements).toBe(0);
  });
});
