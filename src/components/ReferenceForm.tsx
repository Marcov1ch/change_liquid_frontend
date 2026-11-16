import { useEffect, useMemo, useState } from 'react';
import { useToast } from '../context/ToastContext';
import type { ComponentConfig, ReferenceItem, ReferenceItemPayload } from '../types';
import { usesVolume } from '../utils/reference';

interface VariantDraft {
  name: string;
  approvals: string;
}

interface Props {
  configs: ComponentConfig[];
  initial?: ReferenceItem | null;
  usedComponents: string[];
  onSubmit: (payload: ReferenceItemPayload) => Promise<void> | void;
  onCancel: () => void;
}

export function ReferenceForm({ configs, initial, usedComponents, onSubmit, onCancel }: Props) {
  const { toast } = useToast();
  const availableConfigs = useMemo(
    () => configs.filter(config => (
      initial ? config.key === initial.component_type : !usedComponents.includes(config.key)
    )),
    [configs, initial, usedComponents],
  );

  const [componentType, setComponentType] = useState(initial?.component_type ?? availableConfigs[0]?.key ?? '');
  const [volume, setVolume] = useState(initial?.volume_liters != null ? String(initial.volume_liters) : '');
  const [note, setNote] = useState(initial?.note ?? '');
  const [variants, setVariants] = useState<VariantDraft[]>(
    initial && initial.variants.length > 0
      ? initial.variants.map(variant => ({ name: variant.name, approvals: variant.approvals ?? '' }))
      : [{ name: '', approvals: '' }],
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!componentType && availableConfigs[0]) {
      setComponentType(availableConfigs[0].key);
    }
  }, [componentType, availableConfigs]);

  const showVolume = usesVolume(componentType, configs);
  const componentName = availableConfigs.find(config => config.key === componentType)?.name;

  const updateVariant = (index: number, partial: Partial<VariantDraft>) => {
    setVariants(prev => prev.map((variant, position) => (
      position === index ? { ...variant, ...partial } : variant
    )));
  };

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, position) => position !== index));
  };

  const addVariant = () => {
    setVariants(prev => [...prev, { name: '', approvals: '' }]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!componentType) {
      toast.error('Выберите компонент');
      return;
    }

    let volumeLiters: number | null = null;
    if (showVolume && volume.trim() !== '') {
      const parsed = Number(volume);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        toast.error('Объём должен быть больше 0');
        return;
      }
      volumeLiters = Math.round(parsed * 100) / 100;
    }

    const cleanVariants = variants
      .map(variant => ({
        name: variant.name.trim(),
        approvals: variant.approvals.trim() || null,
      }))
      .filter(variant => variant.name !== '');

    if (volumeLiters === null && cleanVariants.length === 0) {
      toast.error('Укажите объём или хотя бы один вариант');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        component_type: componentType,
        volume_liters: volumeLiters,
        note: note.trim() || null,
        variants: cleanVariants,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (availableConfigs.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-body-md text-outline m-0">
          Для всех компонентов справочные данные уже добавлены.
        </p>
        <div className="flex justify-end">
          <button type="button" onClick={onCancel} className="md3-btn-text">Закрыть</button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-label-md text-surface-on-variant mb-1">Компонент *</label>
        <select
          value={componentType}
          onChange={(event) => setComponentType(event.target.value)}
          className="md3-select"
          disabled={!!initial}
        >
          {availableConfigs.map(config => (
            <option key={config.key} value={config.key}>{config.name}</option>
          ))}
        </select>
      </div>

      {showVolume && (
        <div>
          <label className="block text-label-md text-surface-on-variant mb-1">
            Заправочный объём, л
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="5.7"
            value={volume}
            onChange={(event) => setVolume(event.target.value)}
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
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="md3-field"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-label-md text-surface-on-variant">
            {showVolume ? 'Варианты и допуски' : 'Название и допуски'}
          </span>
          <button type="button" onClick={addVariant} className="md3-btn-text !px-3 !py-1.5">
            + Вариант
          </button>
        </div>

        {variants.length === 0 && (
          <p className="text-body-sm text-outline m-0">
            {showVolume
              ? 'Можно оставить пустым, если объёма достаточно.'
              : 'Добавьте хотя бы одно название.'}
          </p>
        )}

        {variants.map((variant, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-1 flex flex-col gap-2">
              <input
                type="text"
                maxLength={100}
                placeholder={showVolume ? '0W-20' : (componentName ? `Например: ${componentName}` : 'Название')}
                value={variant.name}
                onChange={(event) => updateVariant(index, { name: event.target.value })}
                className="md3-field"
              />
              <input
                type="text"
                maxLength={300}
                placeholder="Допуски: VW 504 00, BMW LL-04"
                value={variant.approvals}
                onChange={(event) => updateVariant(index, { approvals: event.target.value })}
                className="md3-field"
              />
            </div>
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
          </div>
        ))}
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onCancel} className="md3-btn-text">Отмена</button>
        <button type="submit" disabled={submitting} className="md3-btn-primary">
          {submitting ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </form>
  );
}
