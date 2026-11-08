import type { PublicOtherExpense, PublicReplacement } from '../types';

export function calcReplacementsCost(replacements: PublicReplacement[]): number {
  return replacements.reduce(
    (sum, replacement) => sum + (replacement.component_price ?? 0) + (replacement.work_price ?? 0),
    0,
  );
}

export function calcOtherExpensesCost(expenses: PublicOtherExpense[]): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export function calcTotalCost(
  replacements: PublicReplacement[],
  expenses: PublicOtherExpense[],
): number {
  return calcReplacementsCost(replacements) + calcOtherExpensesCost(expenses);
}
