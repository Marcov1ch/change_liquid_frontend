import type { ComponentConfig, ReferenceItem } from '../types';

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
