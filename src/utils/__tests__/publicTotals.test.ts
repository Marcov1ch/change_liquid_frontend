import { describe, expect, it } from 'vitest';
import type { PublicOtherExpense, PublicReplacement } from '../../types';
import { calcOtherExpensesCost, calcReplacementsCost, calcTotalCost } from '../publicTotals';

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

describe('publicTotals', () => {
  it('sums component and work prices', () => {
    expect(calcReplacementsCost([replacement(5000, 1500), replacement(null, 500)])).toBe(7000);
  });

  it('sums other expenses', () => {
    expect(calcOtherExpensesCost([expense(500), expense(1200)])).toBe(1700);
  });

  it('does not double count replacements and expenses in the total', () => {
    expect(calcTotalCost([replacement(5000, 1500)], [expense(500), expense(1200)])).toBe(8200);
  });
});
