import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useComponentConfigs } from '../hooks/useEnums';
import type { Vehicle } from '../types';
import { formatIntervalSummary, referenceItemSummary } from '../utils/reference';
import { ReferenceComponentModal } from './ReferenceComponentModal';

interface Props {
  vehicle: Vehicle;
  onUpdate: () => void;
}

const DATE_NOTIFICATION_LABELS: Record<string, string> = {
  tire_change: 'Шины',
  insurance: 'Страховка',
  parking_monthly: 'Аренда машиноместа',
};

export function ReferenceComponentsPanel({ vehicle, onUpdate }: Props) {
  const { toast } = useToast();
  const { data: configsData, isLoading } = useComponentConfigs();
  const configs = useMemo(() => configsData?.configs ?? [], [configsData]);
  const itemsByType = useMemo(
    () => new Map((vehicle.reference_items ?? []).map(item => [item.component_type, item])),
    [vehicle.reference_items],
  );

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [notifyDraft, setNotifyDraft] = useState<Record<string, boolean>>({});
  const [savingNotify, setSavingNotify] = useState<string | null>(null);
  const [dateNotify, setDateNotify] = useState<Record<string, boolean>>(() => ({
    tire_change: vehicle.notify_flags.tire_change ?? true,
    insurance: vehicle.notify_flags.insurance ?? true,
    parking_monthly: vehicle.notify_flags.parking_monthly ?? true,
  }));
  const [savingDate, setSavingDate] = useState<string | null>(null);

  const readOnly = vehicle.is_active === false;
  const selectedConfig = configs.find(config => config.key === selectedKey) ?? null;
  const selectedItem = selectedKey ? itemsByType.get(selectedKey) : undefined;

  useEffect(() => {
    setNotifyDraft({});
  }, [vehicle.id, vehicle.notify_flags]);

  useEffect(() => {
    setDateNotify({
      tire_change: vehicle.notify_flags.tire_change ?? true,
      insurance: vehicle.notify_flags.insurance ?? true,
      parking_monthly: vehicle.notify_flags.parking_monthly ?? true,
    });
  }, [vehicle.notify_flags]);

  const toggleNotify = async (key: string, checked: boolean) => {
    if (readOnly) return;

    setNotifyDraft(prev => ({ ...prev, [key]: checked }));
    setSavingNotify(key);
    try {
      await api.updateNotify(vehicle.id, { [key]: checked });
      onUpdate();
    } catch (error) {
      setNotifyDraft(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      toast.error(error instanceof Error ? error.message : 'Не удалось сохранить уведомление');
    } finally {
      setSavingNotify(null);
    }
  };

  const toggleDateNotify = async (key: string, checked: boolean) => {
    if (readOnly) return;

    setDateNotify(prev => ({ ...prev, [key]: checked }));
    setSavingDate(key);
    try {
      await api.updateNotify(vehicle.id, { [key]: checked });
      onUpdate();
    } catch (error) {
      setDateNotify(prev => ({ ...prev, [key]: !checked }));
      toast.error(error instanceof Error ? error.message : 'Не удалось сохранить уведомление');
    } finally {
      setSavingDate(null);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {readOnly && (
          <p className="text-body-sm text-outline m-0">
            Автомобиль в архиве — справочник доступен только для чтения.
          </p>
        )}

        {isLoading && configs.length === 0 && (
          <p className="text-body-sm text-outline m-0">Загрузка компонентов...</p>
        )}

        {!isLoading && configs.length === 0 && (
          <p className="text-body-sm text-outline m-0">Нет доступных компонентов.</p>
        )}

        {configs.map(config => {
          const item = itemsByType.get(config.key);
          const km = vehicle.intervals[config.key] ?? config.default_interval;
          const months = vehicle.interval_months[config.key] ?? null;
          const summary = referenceItemSummary(item);
          const filled = summary !== 'Данные не заполнены';
          const checked = notifyDraft[config.key] ?? vehicle.notify_flags[config.key] ?? true;

          return (
            <div
              key={config.key}
              className="flex items-stretch gap-2 rounded-md3-sm border border-outline-variant bg-surface overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setSelectedKey(config.key)}
                className="flex-1 min-w-0 text-left px-4 py-3 hover:bg-surface-variant transition-colors"
                aria-label={`Изменить: ${config.name}`}
              >
                <p className="text-title-sm text-surface-on m-0">{config.name}</p>
                <p className="text-body-sm text-outline m-0 mt-0.5">
                  {formatIntervalSummary(km, months)}
                </p>
                <p className={`text-body-sm m-0 mt-0.5 truncate ${filled ? 'text-primary' : 'text-outline'}`}>
                  {summary}
                </p>
              </button>

              <label
                className="w-20 shrink-0 flex flex-col items-center justify-center gap-1 pr-2 cursor-pointer"
                title={`Уведомлять: ${config.name}`}
              >
                <input
                  type="checkbox"
                  disabled={readOnly || savingNotify === config.key}
                  checked={checked}
                  onChange={(event) => toggleNotify(config.key, event.target.checked)}
                  className="w-5 h-5 rounded-md3-xs accent-primary"
                  aria-label={`Уведомлять: ${config.name}`}
                />
                <span className="text-label-sm text-surface-on-variant text-center leading-4">
                  Уведомлять
                </span>
              </label>
            </div>
          );
        })}

        <div className="rounded-md3-sm border border-outline-variant bg-surface p-3 flex flex-col gap-1">
          <span className="text-title-sm text-surface-on">Напоминания по датам</span>
          {Object.entries(DATE_NOTIFICATION_LABELS).map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer p-1">
              <input
                type="checkbox"
                disabled={readOnly || savingDate === key}
                checked={dateNotify[key] ?? true}
                onChange={(event) => toggleDateNotify(key, event.target.checked)}
                className="w-5 h-5 rounded-md3-xs accent-primary"
              />
              <span className="text-body-sm text-surface-on">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {selectedConfig && (
        <ReferenceComponentModal
          vehicle={vehicle}
          configs={configs}
          config={selectedConfig}
          item={selectedItem}
          readOnly={readOnly}
          onClose={() => setSelectedKey(null)}
          onSaved={onUpdate}
        />
      )}
    </>
  );
}
