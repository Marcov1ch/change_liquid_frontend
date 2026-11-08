import type { PublicOtherExpense, PublicRepair, PublicReplacement } from '../types';

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

export function calcTotalCost(
  replacements: PublicReplacement[],
  repairs: PublicRepair[],
  expenses: PublicOtherExpense[],
): number {
  return (
    calcReplacementsCost(replacements) +
    calcRepairsCost(repairs) +
    calcOtherExpensesCost(expenses)
  );
}
