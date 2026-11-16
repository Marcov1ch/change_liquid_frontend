import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useComponentConfigs } from '../hooks/useEnums';
import type { Vehicle } from '../types';
import {
  buildIntervalDraft,
  buildIntervalPayload,
  resetIntervalRow,
  type IntervalDraft,
} from '../utils/intervalDraft';

interface Props {
  vehicle: Vehicle;
  onUpdate: () => void;
}

const DATE_NOTIFICATION_LABELS: Record<string, string> = {
  tire_change: 'Шины',
  insurance: 'Страховка',
  parking_monthly: 'Аренда машиноместа',
};

export function ReferenceIntervalsPanel({ vehicle, onUpdate }: Props) {
  const { toast } = useToast();
  const { data: configsData } = useComponentConfigs();
  const configs = useMemo(() => configsData?.configs ?? [], [configsData]);

  const [draft, setDraft] = useState<IntervalDraft>({});
  const [dateNotify, setDateNotify] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const readOnly = vehicle.is_active === false;
  const ready = configs.length > 0 && configs.every(config => draft[config.key]);

  useEffect(() => {
    if (!configs.length) return;
    setDraft(buildIntervalDraft(configs, vehicle));
    setDateNotify({
      tire_change: vehicle.notify_flags.tire_change ?? true,
      insurance: vehicle.notify_flags.insurance ?? true,
      parking_monthly: vehicle.notify_flags.parking_monthly ?? true,
    });
  }, [configs, vehicle]);

  const updateRow = (key: string, patch: Partial<IntervalDraft[string]>) => {
    setDraft(prev => ({
      ...prev,
      [key]: { ...(prev[key] ?? { km: '', months: '', notify: true }), ...patch },
    }));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (readOnly || !ready) return;

    const result = buildIntervalPayload(configs, draft);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    setSaving(true);
    try {
      await api.updateVehicle(vehicle.id, {
        ...result.payload,
        notify_flags: {
          ...result.payload.notify_flags,
          ...dateNotify,
        },
      });
      toast.success('Интервалы и уведомления сохранены');
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось сохранить интервалы');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-3">
      {readOnly && (
        <p className="text-body-sm text-outline m-0">
          Автомобиль в архиве — интервалы доступны только для чтения.
        </p>
      )}

      {configs.map(config => {
        const row = draft[config.key];
        return (
          <div
            key={config.key}
            className="rounded-md3-sm border border-outline-variant bg-surface p-3 flex flex-col gap-2"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-title-sm text-surface-on">{config.name}</span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => setDraft(prev => resetIntervalRow(prev, config.key))}
                  className="md3-btn-text !px-2 !py-1 text-label-sm"
                >
                  Сбросить
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-label-sm text-surface-on-variant">Интервал, км</span>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  disabled={readOnly}
                  value={row?.km ?? ''}
                  onChange={(event) => updateRow(config.key, { km: event.target.value })}
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
                  value={row?.months ?? ''}
                  onChange={(event) => updateRow(config.key, { months: event.target.value })}
                  className="md3-field"
                />
              </label>
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-body-sm text-outline">
                По умолчанию: {config.default_interval} км
                {config.default_interval_months ? ` / ${config.default_interval_months} мес` : ''}
              </span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={readOnly}
                  checked={row?.notify ?? true}
                  onChange={(event) => updateRow(config.key, { notify: event.target.checked })}
                  className="w-5 h-5 rounded-md3-xs accent-primary"
                />
                <span className="text-label-sm text-surface-on">Уведомлять</span>
              </label>
            </div>
          </div>
        );
      })}

      <div className="rounded-md3-sm border border-outline-variant bg-surface p-3 flex flex-col gap-2">
        <span className="text-title-sm text-surface-on">Уведомления по датам</span>
        {Object.entries(DATE_NOTIFICATION_LABELS).map(([key, label]) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer p-1">
            <input
              type="checkbox"
              disabled={readOnly}
              checked={dateNotify[key] ?? true}
              onChange={(event) => setDateNotify(prev => ({ ...prev, [key]: event.target.checked }))}
              className="w-5 h-5 rounded-md3-xs accent-primary"
            />
            <span className="text-body-sm text-surface-on">{label}</span>
          </label>
        ))}
      </div>

      {!readOnly && (
        <button type="submit" disabled={saving || !ready} className="md3-btn-primary w-full">
          {saving ? 'Сохранение...' : 'Сохранить интервалы'}
        </button>
      )}
    </form>
  );
}
