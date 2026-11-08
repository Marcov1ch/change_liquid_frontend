import type { Repair, Replacement } from '../types';

export function isPricedReplacement(replacement: Replacement): boolean {
  return (replacement.component_price ?? 0) > 0 || (replacement.work_price ?? 0) > 0;
}

export function findBlockingRepair(
  repairs: Repair[],
  replacementDate: string,
  componentType: string,
): Repair | null {
  return repairs.find(
    repair =>
      repair.repair_date === replacementDate &&
      repair.component_types.includes(componentType),
  ) ?? null;
}

export function hasPricedReplacement(
  replacements: Replacement[],
  replacementDate: string,
  componentType: string,
  excludeRepairId?: number | null,
): boolean {
  return replacements.some(
    replacement =>
      replacement.replacement_date === replacementDate &&
      replacement.component_type === componentType &&
      isPricedReplacement(replacement) &&
      (!excludeRepairId || replacement.source_repair_id !== excludeRepairId),
  );
}
