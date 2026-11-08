import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { useComponentConfigs } from '../hooks/useEnums';
import type { Repair, RepairPayload, Replacement, Vehicle } from '../types';
import { hasPricedReplacement } from '../utils/repairConflicts';

interface Props {
  vehicle: Vehicle;
  replacements: Replacement[];
  initial?: Repair | null;
  today: string;
  onSubmit: (payload: RepairPayload) => Promise<void> | void;
  onCancel: () => void;
}

export function RepairForm({
  vehicle,
  replacements,
  initial,
  today,
  onSubmit,
  onCancel,
}: Props) {
  const { toast } = useToast();
  const { data: configsData } = useComponentConfigs();
  const configs = configsData?.configs ?? [];

  const [repairDate, setRepairDate] = useState(initial?.repair_date ?? today);
  const [kmAtRepair, setKmAtRepair] = useState(String(initial?.km_at_repair ?? vehicle.current_km));
  const [description, setDescription] = useState(initial?.description ?? '');
  const [workCost, setWorkCost] = useState(
    initial ? String(initial.work_cost) : '0',
  );
  const [partsCost, setPartsCost] = useState(
    initial ? String(initial.parts_cost) : '0',
  );
  const [componentTypes, setComponentTypes] = useState<string[]>(initial?.component_types ?? []);
  const [submitting, setSubmitting] = useState(false);

  const conflictingConfigs = configs.filter(
    config =>
      componentTypes.includes(config.key) &&
      hasPricedReplacement(replacements, repairDate, config.key),
  );
  const hasConflict = conflictingConfigs.length > 0;

  const toggleComponent = (key: string) => {
    setComponentTypes(prev =>
      prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key],
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const km = Number(kmAtRepair);
    if (!Number.isFinite(km) || km < 0) {
      toast.error('Пробег должен быть неотрицательным');
      return;
    }

    if (workCost === '' || !Number.isFinite(Number(workCost)) || Number(workCost) < 0) {
      toast.error('Укажите стоимость работ (0, если не оплачено)');
      return;
    }

    if (partsCost === '' || !Number.isFinite(Number(partsCost)) || Number(partsCost) < 0) {
      toast.error('Укажите стоимость запчастей (0, если не оплачено)');
      return;
    }

    if (hasConflict) {
      toast.error('На выбранную дату уже есть замены с ценой для выбранных компонентов');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        repair_date: repairDate,
        km_at_repair: Math.round(km),
        description: description.trim() || null,
        work_cost: Math.round(Number(workCost)),
        parts_cost: Math.round(Number(partsCost)),
        component_types: componentTypes,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-label-md text-surface-on-variant mb-1">Дата *</label>
          <input
            type="date"
            max={today}
            value={repairDate}
            onChange={(e) => setRepairDate(e.target.value)}
            className="md3-field"
          />
        </div>
        <div>
          <label className="block text-label-md text-surface-on-variant mb-1">Пробег, км *</label>
          <input
            type="number"
            min="0"
            value={kmAtRepair}
            onChange={(e) => setKmAtRepair(e.target.value)}
            className="md3-field"
          />
        </div>
      </div>

      <div>
        <label className="block text-label-md text-surface-on-variant mb-1">Описание</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Что сделали: работы, детали, замечания"
          className="md3-field resize-y"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-label-md text-surface-on-variant mb-1">Стоимость работ, ₽ *</label>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={workCost}
            onChange={(e) => setWorkCost(e.target.value)}
            className="md3-field"
          />
        </div>
        <div>
          <label className="block text-label-md text-surface-on-variant mb-1">Стоимость запчастей, ₽ *</label>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={partsCost}
            onChange={(e) => setPartsCost(e.target.value)}
            className="md3-field"
          />
        </div>
      </div>
      <p className="text-body-sm text-outline m-0">
        Если работы или запчасти не оплачивались, укажите 0.
      </p>

      <div>
        <label className="block text-label-md text-surface-on-variant mb-2">Заменённые компоненты</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {configs.map(config => (
            <label
              key={config.key}
              className="flex items-center gap-2 p-2 rounded-md3-sm bg-surface-variant/40 text-body-md text-surface-on cursor-pointer"
            >
              <input
                type="checkbox"
                checked={componentTypes.includes(config.key)}
                onChange={() => toggleComponent(config.key)}
              />
              {config.name}
            </label>
          ))}
        </div>
        <p className="text-body-sm text-outline mt-2">
          Стоимость компонентов указывайте в общей стоимости ремонта - отдельные замены
          создадутся автоматически с нулевой ценой.
        </p>
      </div>

      {hasConflict && (
        <div className="p-3 rounded-md3-sm bg-error-container text-error text-body-sm" role="alert">
          На {repairDate} уже есть замена с ценой для компонента{' '}
          {conflictingConfigs.map(config => config.name).join(', ')}. Чтобы не задвоить сумму,
          уберите компонент из ремонта или измените дату.
        </div>
      )}

      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="md3-btn-text">
          Отмена
        </button>
        <button type="submit" disabled={submitting || hasConflict} className="md3-btn-primary">
          {submitting ? 'Сохранение...' : initial ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </form>
  );
}
