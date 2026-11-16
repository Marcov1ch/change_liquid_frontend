import { useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import type { ComponentConfig, ReferenceItem, Vehicle } from '../types';
import { buildIntervalDraft, buildIntervalPayload } from '../utils/intervalDraft';
import {
  buildReferenceDraft,
  buildReferenceItemPayload,
  referenceItemToPayload,
  replaceReferenceItem,
  usesVolume,
  type ReferenceDraft,
} from '../utils/reference';
import { Modal } from './Modal';

interface Props {
  vehicle: Vehicle;
  configs: ComponentConfig[];
  config: ComponentConfig;
  item?: ReferenceItem | null;
  readOnly: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ReferenceComponentModal({
  vehicle,
  configs,
  config,
  item,
  readOnly,
  onClose,
  onSaved,
}: Props) {
  const { toast } = useToast();
  const showVolume = usesVolume(config.key, configs);
  const initialIntervals = buildIntervalDraft(configs, vehicle);
  const initialRow = initialIntervals[config.key];
  const [km, setKm] = useState(initialRow?.km ?? String(config.default_interval));
  const [months, setMonths] = useState(initialRow?.months ?? '');
  const [notify, setNotify] = useState(initialRow?.notify ?? true);
  const [draft, setDraft] = useState<ReferenceDraft>(() => buildReferenceDraft(item));
  const [saving, setSaving] = useState(false);

  const updateVariant = (index: number, partial: Partial<ReferenceDraft['variants'][number]>) => {
    setDraft(prev => ({
      ...prev,
      variants: prev.variants.map((variant, position) => (
        position === index ? { ...variant, ...partial } : variant
      )),
    }));
  };

  const removeVariant = (index: number) => {
    setDraft(prev => ({
      ...prev,
      variants: prev.variants.filter((_, position) => position !== index),
    }));
  };

  const addVariant = () => {
    setDraft(prev => (
      prev.variants.length >= 20
        ? prev
        : { ...prev, variants: [...prev.variants, { name: '', approvals: '' }] }
    ));
  };

  const resetInterval = () => {
    setKm('0');
    setMonths('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (readOnly) return;

    const referenceResult = buildReferenceItemPayload(config, draft);
    if (!referenceResult.ok) {
      toast.error(referenceResult.error);
      return;
    }

    const nextIntervals = {
      ...initialIntervals,
      [config.key]: { km, months, notify },
    };
    const intervalResult = buildIntervalPayload(configs, nextIntervals);
    if (!intervalResult.ok) {
      toast.error(intervalResult.error);
      return;
    }

    const intervalChanged = !initialRow
      || initialRow.km !== km
      || initialRow.months !== months
      || initialRow.notify !== notify;
    const initialReference = item ? referenceItemToPayload(item) : null;
    const referenceChanged = JSON.stringify(referenceResult.payload) !== JSON.stringify(initialReference);

    if (!intervalChanged && !referenceChanged) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      if (referenceChanged) {
        await api.updateVehicleReference(
          vehicle.id,
          replaceReferenceItem(vehicle.reference_items ?? [], config.key, referenceResult.payload),
        );
      }
      if (intervalChanged) {
        await api.updateVehicle(vehicle.id, intervalResult.payload);
      }
      toast.success('Компонент обновлён');
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось сохранить изменения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={config.name}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {readOnly && (
          <p className="text-body-sm text-outline m-0">
            Автомобиль в архиве — справочник доступен только для чтения.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-label-sm text-surface-on-variant">Интервал, км</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              disabled={readOnly}
              value={km}
              onChange={(event) => setKm(event.target.value)}
              className="md3-field"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-label-sm text-surface-on-variant">Интервал, мес</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="—"
              disabled={readOnly}
              value={months}
              onChange={(event) => setMonths(event.target.value)}
              className="md3-field"
            />
          </label>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-body-sm text-outline">
            По умолчанию: {config.default_interval} км
            {config.default_interval_months ? ` / ${config.default_interval_months} мес` : ''}
          </span>
          {!readOnly && (
            <button type="button" onClick={resetInterval} className="md3-btn-text !px-2 !py-1 text-label-sm">
              Сбросить
            </button>
          )}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            disabled={readOnly}
            checked={notify}
            onChange={(event) => setNotify(event.target.checked)}
            className="w-5 h-5 rounded-md3-xs accent-primary"
          />
          <span className="text-label-md text-surface-on">Уведомлять о замене</span>
        </label>

        {showVolume && (
          <div>
            <label className="block text-label-md text-surface-on-variant mb-1">
              Заправочный объём, л
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              inputMode="decimal"
              placeholder="5.7"
              disabled={readOnly}
              value={draft.volume}
              onChange={(event) => setDraft(prev => ({ ...prev, volume: event.target.value }))}
              className="md3-field"
            />
          </div>
        )}

        <div>
          <label className="block text-label-md text-surface-on-variant mb-1">Заметка</label>
          <input
            type="text"
            maxLength={500}
            placeholder="Например: с фильтром / без фильтра"
            disabled={readOnly}
            value={draft.note}
            onChange={(event) => setDraft(prev => ({ ...prev, note: event.target.value }))}
            className="md3-field"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-label-md text-surface-on-variant">
              {showVolume ? 'Варианты и допуски' : 'Название и допуски'}
            </span>
            {!readOnly && (
              <button
                type="button"
                onClick={addVariant}
                disabled={draft.variants.length >= 20}
                className="md3-btn-text !px-3 !py-1.5"
              >
                + Вариант
              </button>
            )}
          </div>

          {draft.variants.length === 0 && (
            <p className="text-body-sm text-outline m-0">
              {showVolume
                ? 'Можно оставить пустым, если объёма достаточно.'
                : 'Добавьте хотя бы одно название.'}
            </p>
          )}

          {draft.variants.map((variant, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1 flex flex-col gap-2">
                <input
                  type="text"
                  maxLength={100}
                  placeholder={showVolume ? '0W-20' : `Например: ${config.name}`}
                  disabled={readOnly}
                  value={variant.name}
                  onChange={(event) => updateVariant(index, { name: event.target.value })}
                  className="md3-field"
                />
                <input
                  type="text"
                  maxLength={300}
                  placeholder="Допуски: VW 504 00, BMW LL-04"
                  disabled={readOnly}
                  value={variant.approvals}
                  onChange={(event) => updateVariant(index, { approvals: event.target.value })}
                  className="md3-field"
                />
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="flex items-center justify-center w-9 h-9 rounded-md3-full text-error hover:bg-error-container transition-colors mt-1"
                  aria-label="Удалить вариант"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onClose} className="md3-btn-text">
            {readOnly ? 'Закрыть' : 'Отмена'}
          </button>
          {!readOnly && (
            <button type="submit" disabled={saving} className="md3-btn-primary">
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
