import type { PublicFuelRecord, PublicOtherExpense, PublicRepair, PublicReplacement } from '../types';

export function calcReplacementsCost(replacements: PublicReplacement[]): number {
  return replacements.reduce(
    (sum, replacement) => sum + (replacement.component_price ?? 0) + (replacement.work_price ?? 0),
    0,
  );
}

export function calcOtherExpensesCost(expenses: PublicOtherExpense[]): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export function calcRepairsCost(repairs: PublicRepair[]): number {
  return repairs.reduce(
    (sum, repair) => sum + repair.work_cost + repair.parts_cost,
    0,
  );
}

export function calcFuelCost(fuelRecords: PublicFuelRecord[]): number {
  return fuelRecords.reduce((sum, record) => sum + record.total_cost, 0);
}

export function calcTotalCost(
  replacements: PublicReplacement[],
  repairs: PublicRepair[],
  fuelRecords: PublicFuelRecord[],
  expenses: PublicOtherExpense[],
): number {
  return (
    calcReplacementsCost(replacements) +
    calcRepairsCost(repairs) +
    calcFuelCost(fuelRecords) +
    calcOtherExpensesCost(expenses)
  );
}
