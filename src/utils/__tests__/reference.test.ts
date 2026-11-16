import { describe, expect, it } from 'vitest';
import type { ComponentConfig, ReferenceItem } from '../../types';
import { formatVolume, sortReferenceItems, usesVolume } from '../reference';

const configs: ComponentConfig[] = [
  { key: 'engine_oil', name: 'Моторное масло', example: '', default_interval: 1, supports_volume: true },
  { key: 'cabin_filter', name: 'Фильтр салона', example: '', default_interval: 1, supports_volume: false },
];

function item(componentType: string): ReferenceItem {
  return { component_type: componentType, volume_liters: null, note: null, variants: [] };
}

describe('formatVolume', () => {
  it('formats liters and empty values', () => {
    expect(formatVolume(5.7)).toBe('5,7 л');
    expect(formatVolume(null)).toBe('—');
  });
});

describe('usesVolume', () => {
  it('follows the component config', () => {
    expect(usesVolume('engine_oil', configs)).toBe(true);
    expect(usesVolume('cabin_filter', configs)).toBe(false);
  });
});

describe('sortReferenceItems', () => {
  it('orders items by component config order', () => {
    const sorted = sortReferenceItems([item('cabin_filter'), item('engine_oil')], configs);
    expect(sorted.map(entry => entry.component_type)).toEqual(['engine_oil', 'cabin_filter']);
  });
});
