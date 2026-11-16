import type { ComponentConfig, ReferenceItem, ReferenceItemPayload } from '../types';

export interface ReferenceVariantDraft {
  name: string;
  approvals: string;
}

export interface ReferenceDraft {
  volume: string;
  note: string;
  variants: ReferenceVariantDraft[];
}

export function buildReferenceDraft(item?: ReferenceItem | null): ReferenceDraft {
  if (!item) {
    return { volume: '', note: '', variants: [{ name: '', approvals: '' }] };
  }
  return {
    volume: item.volume_liters != null ? String(item.volume_liters) : '',
    note: item.note ?? '',
    variants: item.variants.length > 0
      ? item.variants.map(variant => ({
        name: variant.name,
        approvals: variant.approvals ?? '',
      }))
      : [{ name: '', approvals: '' }],
  };
}

export function referenceItemToPayload(item: ReferenceItem): ReferenceItemPayload {
  return {
    component_type: item.component_type,
    volume_liters: item.volume_liters,
    note: item.note,
    variants: item.variants.map(variant => ({
      name: variant.name,
      approvals: variant.approvals,
    })),
  };
}

export function buildReferenceItemPayload(
  config: ComponentConfig,
  draft: ReferenceDraft,
): { ok: true; payload: ReferenceItemPayload | null } | { ok: false; error: string } {
  const supportsVolume = config.supports_volume !== false;
  const volumeRaw = supportsVolume ? draft.volume.trim() : '';
  let volumeLiters: number | null = null;

  if (volumeRaw !== '') {
    const parsed = Number(volumeRaw);
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 100) {
      return { ok: false, error: 'Объём должен быть больше 0 и не больше 100 л' };
    }
    volumeLiters = Math.round(parsed * 100) / 100;
  }

  const variants = draft.variants
    .map(variant => ({
      name: variant.name.trim(),
      approvals: variant.approvals.trim() || null,
    }))
    .filter(variant => variant.name !== '');

  if (variants.length > 20) {
    return { ok: false, error: 'Не больше 20 вариантов' };
  }

  const note = draft.note.trim() || null;
  if (volumeLiters === null && variants.length === 0) {
    if (note !== null) {
      return { ok: false, error: 'Укажите объём или хотя бы один вариант' };
    }
    return { ok: true, payload: null };
  }

  return {
    ok: true,
    payload: {
      component_type: config.key,
      volume_liters: volumeLiters,
      note,
      variants,
    },
  };
}

export function replaceReferenceItem(
  items: ReferenceItem[],
  componentType: string,
  payload: ReferenceItemPayload | null,
): ReferenceItemPayload[] {
  const next = items
    .filter(item => item.component_type !== componentType)
    .map(referenceItemToPayload);

  return payload ? [...next, payload] : next;
}

export function referenceItemSummary(item?: ReferenceItem | null): string {
  if (!item) return 'Данные не заполнены';

  const parts: string[] = [];
  if (item.volume_liters != null) {
    parts.push(formatVolume(item.volume_liters));
  }
  const names = item.variants.map(variant => variant.name).filter(Boolean);
  if (names.length > 0) {
    parts.push(names.join(', '));
  }

  return parts.length > 0 ? parts.join(' · ') : 'Данные не заполнены';
}

export function formatIntervalSummary(km: number, months: number | null): string {
  const distance = `${String(km).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} км`;
  return months == null ? distance : `${distance} · ${months} мес`;
}

export function formatVolume(value: number | null | undefined): string {
  if (value == null) return '—';
  const amount = value.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
  return `${amount} л`;
}

export function usesVolume(type: string, configs: ComponentConfig[]): boolean {
  return configs.find(config => config.key === type)?.supports_volume !== false;
}

export function referenceComponentName(type: string, configs: ComponentConfig[]): string {
  return configs.find(config => config.key === type)?.name ?? type;
}

export function sortReferenceItems(
  items: ReferenceItem[],
  configs: ComponentConfig[],
): ReferenceItem[] {
  const order = new Map(configs.map((config, index) => [config.key, index]));
  return [...items].sort((a, b) => {
    const left = order.get(a.component_type) ?? Number.MAX_SAFE_INTEGER;
    const right = order.get(b.component_type) ?? Number.MAX_SAFE_INTEGER;
    return left - right;
  });
}
