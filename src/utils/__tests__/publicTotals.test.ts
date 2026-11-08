import { describe, expect, it } from 'vitest';
import type { PublicFuelRecord, PublicOtherExpense, PublicRepair, PublicReplacement } from '../../types';
import {
  calcFuelCost,
  calcOtherExpensesCost,
  calcRepairsCost,
  calcReplacementsCost,
  calcTotalCost,
} from '../publicTotals';

function replacement(componentPrice: number | null, workPrice: number | null): PublicReplacement {
  return {
    id: 1,
    component_type: 'engine_oil',
    component_name: 'Масло',
    component_price: componentPrice,
    work_price: workPrice,
    replacement_date: '2026-01-01',
    km_at_replacement: 10000,
    interval_km: 7000,
  };
}

function expense(amount: number): PublicOtherExpense {
  return {
    id: 1,
    name: 'Штраф',
    expense_date: '2026-01-10',
    amount,
  };
}

function fuel(totalCost: number): PublicFuelRecord {
  return {
    id: 1,
    fuel_date: '2026-01-06',
    km_at_fuel: 10500,
    liters: 35.5,
    total_cost: totalCost,
    consumption_l_per_100km: 7.1,
  };
}

function repair(workCost: number, partsCost: number): PublicRepair {
  return {
    id: 1,
    repair_date: '2026-01-05',
    km_at_repair: 10000,
    description: 'ТО',
    work_cost: workCost,
    parts_cost: partsCost,
    component_types: ['engine_oil'],
  };
}

describe('publicTotals', () => {
  it('sums component and work prices', () => {
    expect(calcReplacementsCost([replacement(5000, 1500), replacement(null, 500)])).toBe(7000);
  });

  it('sums repair work and parts costs', () => {
    expect(calcRepairsCost([repair(2000, 3000), repair(0, 0), repair(200, 1000)])).toBe(6200);
  });

  it('sums fuel costs', () => {
    expect(calcFuelCost([fuel(2500), fuel(1800)])).toBe(4300);
  });

  it('sums other expenses', () => {
    expect(calcOtherExpensesCost([expense(500), expense(1200)])).toBe(1700);
  });

  it('does not double count replacements, repairs, fuel and expenses in the total', () => {
    expect(
      calcTotalCost(
        [replacement(5000, 1500)],
        [repair(3000, 5000)],
        [fuel(2500), fuel(1800)],
        [expense(500), expense(1200)],
      ),
    ).toBe(20500);
  });
});
