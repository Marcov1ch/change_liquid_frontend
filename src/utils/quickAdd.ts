import type { Repair } from '../types';
import type { NewReplacementData } from '../components/AddReplacementForm';
import { roundMoney } from './currency';
import { isDateBasedComponent, isDateOnlyComponent } from './replacementTypes';

export function validateKmUpdate(currentKm: number, input: string): { ok: true; newKm: number } | { ok: false; error: string } {
  const value = Number(input);
  if (!Number.isFinite(value) || input.trim() === '') {
    return { ok: false, error: 'Введите пробег' };
  }
  if (value <= currentKm) {
    return { ok: false, error: 'Пробег должен быть больше текущего' };
  }
  return { ok: true, newKm: Math.round(value) };
}

export function buildReplacementPayload(
  data: NewReplacementData,
  blockedByRepair: Repair | null,
): { ok: true; payload: Record<string, string | number> } | { ok: false; error: string } {
  if (!data.component_name.trim()) {
    return { ok: false, error: 'Введите название компонента' };
  }

  const isDateBased = isDateBasedComponent(data.component_type);
  const isDateOnly = isDateOnlyComponent(data.component_type);

  if (isDateBased && !data.next_change_date) {
    return {
      ok: false,
      error: isDateOnly ? 'Укажите дату окончания' : 'Укажите дату следующей замены',
    };
  }

  const payload: Record<string, string | number> = {
    component_type: data.component_type,
    component_name: data.component_name.trim(),
    replacement_date: data.replacement_date,
    component_price: blockedByRepair
      ? 0
      : roundMoney(parseFloat(data.component_price) || 0),
  };

  if (isDateOnly) {
    payload.km_at_replacement = 0;
    payload.next_change_date = data.next_change_date;
  } else if (isDateBased) {
    payload.km_at_replacement = data.km_at_replacement;
    payload.work_price = blockedByRepair
      ? 0
      : roundMoney(parseFloat(data.work_price) || 0);
    payload.next_change_date = data.next_change_date;
  } else {
    payload.km_at_replacement = data.km_at_replacement;
    payload.work_price = blockedByRepair
      ? 0
      : roundMoney(parseFloat(data.work_price) || 0);
  }

  return { ok: true, payload };
}
