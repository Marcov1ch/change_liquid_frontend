import { useMemo, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useComponentConfigs } from '../hooks/useEnums';
import type { ReferenceItem, ReferenceItemPayload, Vehicle } from '../types';
import { formatVolume, referenceComponentName, sortReferenceItems, usesVolume } from '../utils/reference';
import { Modal } from './Modal';
import { ReferenceForm } from './ReferenceForm';

interface Props {
  vehicle: Vehicle;
  onUpdate: () => void;
}

function toPayload(items: ReferenceItem[]): ReferenceItemPayload[] {
  return items.map(item => ({
    component_type: item.component_type,
    volume_liters: item.volume_liters,
    note: item.note,
    variants: item.variants.map(variant => ({
      name: variant.name,
      approvals: variant.approvals,
    })),
  }));
}

export function ReferenceComponentsPanel({ vehicle, onUpdate }: Props) {
  const { toast } = useToast();
  const { data: configsData } = useComponentConfigs();
  const configs = useMemo(() => configsData?.configs ?? [], [configsData]);
  const items = useMemo(
    () => sortReferenceItems(vehicle.reference_items ?? [], configs),
    [vehicle.reference_items, configs],
  );

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ReferenceItem | null>(null);
  const [saving, setSaving] = useState(false);

  const readOnly = vehicle.is_active === false;
  const usedComponents = items.map(item => item.component_type);
  const canAdd = configs.some(config => !usedComponents.includes(config.key));

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (item: ReferenceItem) => {
    setEditing(item);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const save = async (next: ReferenceItem[]) => {
    setSaving(true);
    try {
      await api.updateVehicleReference(vehicle.id, toPayload(next));
      toast.success(editing ? 'Справочные данные обновлены' : 'Компонент добавлен');
      closeForm();
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось сохранить справочные данные');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (payload: ReferenceItemPayload) => {
    if (editing) {
      const next = items.map(item => (
        item.component_type === editing.component_type
          ? { ...payload, component_type: item.component_type }
          : item
      ));
      await save(next);
      return;
    }
    await save([...items, payload]);
  };

  const handleDelete = async (item: ReferenceItem) => {
    const name = referenceComponentName(item.component_type, configs);
    if (!confirm(`Удалить справочные данные для «${name}»?`)) return;

    setSaving(true);
    try {
      await api.updateVehicleReference(
        vehicle.id,
        toPayload(items.filter(entry => entry.component_type !== item.component_type)),
      );
      toast.success('Справочные данные удалены');
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось удалить справочные данные');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <p className="text-title-sm text-surface-on mb-1">Нет справочных данных</p>
            <p className="text-body-md text-outline max-w-sm">
              Добавьте заправочные объёмы и допуски для себя: например, 5,7 л масла 0W-20
              и 5W-30. Это не влияет на замены и статистику.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map(item => {
              const name = referenceComponentName(item.component_type, configs);
              const showVolume = usesVolume(item.component_type, configs);
              return (
                <div
                  key={item.component_type}
                  className="rounded-md3-sm border border-outline-variant bg-surface overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3 px-4 py-3 bg-surface-variant/40">
                    <div className="min-w-0">
                      <p className="text-title-sm text-surface-on m-0">{name}</p>
                      {showVolume && (
                        <p className="text-body-sm text-primary m-0 mt-0.5">
                          Объём: {formatVolume(item.volume_liters)}
                        </p>
                      )}
                      {item.note && (
                        <p className="text-body-sm text-outline m-0 mt-0.5">{item.note}</p>
                      )}
                    </div>
                    {!readOnly && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEdit(item)}
                          className="flex items-center justify-center w-8 h-8 rounded-md3-full text-surface-on-variant hover:bg-surface-variant transition-colors"
                          aria-label={`Редактировать ${name}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          disabled={saving}
                          className="flex items-center justify-center w-8 h-8 rounded-md3-full text-error hover:bg-error-container transition-colors disabled:opacity-40"
                          aria-label={`Удалить ${name}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="px-4 py-3 flex flex-col gap-2">
                    {item.variants.length === 0 ? (
                      <p className="text-body-sm text-outline m-0">Варианты не добавлены</p>
                    ) : (
                      item.variants.map((variant, index) => (
                        <div
                          key={`${variant.name}-${index}`}
                          className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-1 sm:gap-4 text-body-sm"
                        >
                          <span className="text-surface-on">{variant.name}</span>
                          <span className="text-outline">{variant.approvals ?? '—'}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!readOnly && canAdd && (
          <div>
            <button onClick={openCreate} className="md3-btn-primary w-full">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Добавить компонент
            </button>
          </div>
        )}

        {readOnly && (
          <p className="text-body-sm text-outline m-0">
            Автомобиль в архиве — справочные данные доступны только для чтения.
          </p>
        )}
      </div>

      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editing ? 'Редактировать справочные данные' : 'Новый компонент'}
      >
        <ReferenceForm
          configs={configs}
          initial={editing}
          usedComponents={usedComponents}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>
    </>
  );
}
