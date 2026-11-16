import { describe, expect, it } from 'vitest';
import type { ComponentConfig, ReferenceItem } from '../../types';
import {
  buildReferenceDraft,
  buildReferenceItemPayload,
  formatIntervalSummary,
  formatVolume,
  referenceItemSummary,
  referenceItemToPayload,
  replaceReferenceItem,
  sortReferenceItems,
  usesVolume,
} from '../reference';

const configs: ComponentConfig[] = [
  { key: 'engine_oil', name: 'Моторное масло', example: '', default_interval: 1, supports_volume: true },
  { key: 'cabin_filter', name: 'Фильтр салона', example: '', default_interval: 1, supports_volume: false },
];

function item(componentType: string): ReferenceItem {
  return { component_type: componentType, volume_liters: null, note: null, variants: [] };
}

const oilItem: ReferenceItem = {
  component_type: 'engine_oil',
  volume_liters: 5.7,
  note: 'с фильтром',
  variants: [
    { name: '0W-20', approvals: 'VW 508 00' },
    { name: '5W-30', approvals: null },
  ],
};

function oilDraft() {
  return {
    volume: '5.7',
    note: 'с фильтром',
    variants: [
      { name: '0W-20', approvals: 'VW 508 00' },
      { name: '5W-30', approvals: '' },
    ],
  };
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

describe('buildReferenceDraft', () => {
  it('fills the draft from a reference item', () => {
    expect(buildReferenceDraft(oilItem)).toEqual(oilDraft());
  });

  it('starts with one empty variant when there is no item', () => {
    expect(buildReferenceDraft(null)).toEqual({
      volume: '',
      note: '',
      variants: [{ name: '', approvals: '' }],
    });
  });
});

describe('buildReferenceItemPayload', () => {
  it('accepts volume without variants', () => {
    const result = buildReferenceItemPayload(configs[0], {
      volume: '5.7',
      note: '',
      variants: [{ name: '', approvals: '' }],
    });
    expect(result).toEqual({
      ok: true,
      payload: {
        component_type: 'engine_oil',
        volume_liters: 5.7,
        note: null,
        variants: [],
      },
    });
  });

  it('ignores volume for components without volume support', () => {
    const result = buildReferenceItemPayload(configs[1], {
      volume: '5',
      note: '',
      variants: [{ name: 'MANN CUK 2643', approvals: 'угольный' }],
    });
    expect(result.ok && result.payload).toEqual({
      component_type: 'cabin_filter',
      volume_liters: null,
      note: null,
      variants: [{ name: 'MANN CUK 2643', approvals: 'угольный' }],
    });
  });

  it('returns null payload for an empty draft', () => {
    expect(buildReferenceItemPayload(configs[0], {
      volume: '',
      note: '',
      variants: [{ name: '', approvals: '' }],
    })).toEqual({ ok: true, payload: null });
  });

  it('rejects a note without volume or variants', () => {
    const result = buildReferenceItemPayload(configs[0], {
      volume: '',
      note: 'только заметка',
      variants: [{ name: '', approvals: '' }],
    });
    expect(result.ok).toBe(false);
  });

  it('rejects invalid volume values', () => {
    expect(buildReferenceItemPayload(configs[0], {
      volume: '0',
      note: '',
      variants: [],
    }).ok).toBe(false);
    expect(buildReferenceItemPayload(configs[0], {
      volume: '101',
      note: '',
      variants: [],
    }).ok).toBe(false);
  });

  it('rejects more than 20 variants', () => {
    const result = buildReferenceItemPayload(configs[1], {
      volume: '',
      note: '',
      variants: Array.from({ length: 21 }, (_, index) => ({
        name: `Вариант ${index + 1}`,
        approvals: '',
      })),
    });
    expect(result.ok).toBe(false);
  });
});

describe('referenceItemToPayload', () => {
  it('strips ids and empty approvals', () => {
    expect(referenceItemToPayload(oilItem)).toEqual({
      component_type: 'engine_oil',
      volume_liters: 5.7,
      note: 'с фильтром',
      variants: [
        { name: '0W-20', approvals: 'VW 508 00' },
        { name: '5W-30', approvals: null },
      ],
    });
  });
});

describe('replaceReferenceItem', () => {
  it('replaces an existing component and preserves the rest', () => {
    const next = replaceReferenceItem([oilItem, item('cabin_filter')], 'engine_oil', {
      component_type: 'engine_oil',
      volume_liters: 6,
      note: null,
      variants: [],
    });
    expect(next).toHaveLength(2);
    expect(next.find(entry => entry.component_type === 'engine_oil')?.volume_liters).toBe(6);
    expect(next.find(entry => entry.component_type === 'cabin_filter')).toBeTruthy();
  });

  it('removes a component when payload is null', () => {
    const next = replaceReferenceItem([oilItem, item('cabin_filter')], 'engine_oil', null);
    expect(next.map(entry => entry.component_type)).toEqual(['cabin_filter']);
  });
});

describe('referenceItemSummary', () => {
  it('joins volume and variant names', () => {
    expect(referenceItemSummary(oilItem)).toBe('5,7 л · 0W-20, 5W-30');
  });

  it('handles missing reference data', () => {
    expect(referenceItemSummary(undefined)).toBe('Данные не заполнены');
    expect(referenceItemSummary(item('engine_oil'))).toBe('Данные не заполнены');
  });
});

describe('formatIntervalSummary', () => {
  it('formats kilometres and months', () => {
    expect(formatIntervalSummary(7000, 12)).toBe('7 000 км · 12 мес');
    expect(formatIntervalSummary(7000, null)).toBe('7 000 км');
  });
});
