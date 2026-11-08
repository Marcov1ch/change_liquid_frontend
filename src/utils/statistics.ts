import type {
  MonthlyStatistics,
  PublicFuelRecord,
  PublicOtherExpense,
  PublicRepair,
  PublicReplacement,
  StatisticsTotals,
  VehicleStatistics,
} from '../types';

interface DatedCost {
  year: number;
  month: number;
  amount: number;
}

const MONTHS_COUNT = 12;

function parseDateParts(value: string): { year: number; month: number } | null {
  const [yearPart, monthPart] = value.split('-');
  const year = Number(yearPart);
  const month = Number(monthPart);

  if (!Number.isInteger(year) || !Number.isInteger(month)) return null;
  if (month < 1 || month > MONTHS_COUNT) return null;

  return { year, month };
}

function replacementCost(record: PublicReplacement): number {
  return (record.component_price ?? 0) + (record.work_price ?? 0);
}

function collectDatedCosts(
  replacements: PublicReplacement[],
  repairs: PublicRepair[],
  fuelRecords: PublicFuelRecord[],
  otherExpenses: PublicOtherExpense[],
): {
  replacements: DatedCost[];
  repairs: DatedCost[];
  fuel: DatedCost[];
  other_expenses: DatedCost[];
} {
  const toDated = (date: string, amount: number): DatedCost | null => {
    const parts = parseDateParts(date);
    return parts ? { ...parts, amount } : null;
  };

  const collect = (
    items: Array<{ date: string; amount: number }>,
  ): DatedCost[] =>
    items
      .map(item => toDated(item.date, item.amount))
      .filter((item): item is DatedCost => item !== null);

  return {
    replacements: collect(
      replacements.map(item => ({ date: item.replacement_date, amount: replacementCost(item) })),
    ),
    repairs: collect(
      repairs.map(item => ({
        date: item.repair_date,
        amount: item.work_cost + item.parts_cost,
      })),
    ),
    fuel: collect(
      fuelRecords.map(item => ({ date: item.fuel_date, amount: item.total_cost })),
    ),
    other_expenses: collect(
      otherExpenses.map(item => ({ date: item.expense_date, amount: item.amount })),
    ),
  };
}

function emptyMonths(): MonthlyStatistics[] {
  return Array.from({ length: MONTHS_COUNT }, (_, index) => ({
    month: index + 1,
    replacements: 0,
    repairs: 0,
    fuel: 0,
    other_expenses: 0,
    total: 0,
  }));
}

export function buildVehicleStatistics(
  replacements: PublicReplacement[],
  repairs: PublicRepair[],
  fuelRecords: PublicFuelRecord[],
  otherExpenses: PublicOtherExpense[],
  year: number,
): VehicleStatistics {
  const dated = collectDatedCosts(replacements, repairs, fuelRecords, otherExpenses);
  const months = emptyMonths();
  const totals: StatisticsTotals = {
    replacements: 0,
    repairs: 0,
    fuel: 0,
    other_expenses: 0,
    total: 0,
  };
  const years = new Set<number>([new Date().getFullYear()]);

  const apply = (
    items: DatedCost[],
    key: 'replacements' | 'repairs' | 'fuel' | 'other_expenses',
  ) => {
    items.forEach(item => {
      years.add(item.year);
      if (item.year !== year) return;

      months[item.month - 1][key] += item.amount;
      totals[key] += item.amount;
    });
  };

  apply(dated.replacements, 'replacements');
  apply(dated.repairs, 'repairs');
  apply(dated.fuel, 'fuel');
  apply(dated.other_expenses, 'other_expenses');

  months.forEach(month => {
    month.total =
      month.replacements +
      month.repairs +
      month.fuel +
      month.other_expenses;
  });
  totals.total =
    totals.replacements + totals.repairs + totals.fuel + totals.other_expenses;

  return {
    year,
    available_years: [...years].sort((a, b) => b - a),
    months,
    totals,
    max_monthly_total: Math.max(0, ...months.map(month => month.total)),
  };
}
