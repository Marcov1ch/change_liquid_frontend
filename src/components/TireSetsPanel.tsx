import { useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import type { Replacement, TireSet, TireSetPayload, Vehicle } from '../types';
import {
  formatKm,
  formatTireMoney,
  getTireStatusMeta,
  isTireChange,
  sortTireEvents,
  TIRE_SEASON_ICONS,
  TIRE_SEASON_LABELS,
  tireStatusNote,
} from '../utils/tireSets';
import { Modal } from './Modal';
import { TireInstallForm } from './TireInstallForm';
import { TireSetForm } from './TireSetForm';
import { VehicleCardHeader } from './VehicleCardHeader';

interface Props {
  tireSets: TireSet[];
  replacements: Replacement[];
  vehicleId: number | null;
  selectedVehicle: Vehicle | undefined;
  onClose: () => void;
  onShare: () => void;
  onTireSetsUpdate: () => void;
}

function formatEventLabel(replacement: Replacement): string {
  if (replacement.tire_event_type === 'purchase') return 'Покупка';
  if (replacement.tire_event_type === 'install') return 'Установка';
  return 'Замена';
}

export function TireSetsPanel({
  tireSets,
  replacements,
  vehicleId,
  selectedVehicle,
  onClose,
  onShare,
  onTireSetsUpdate,
}: Props) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingSet, setEditingSet] = useState<TireSet | null>(null);
  const [installTarget, setInstallTarget] = useState<TireSet | null>(null);
  const [installing, setInstalling] = useState(false);

  if (!vehicleId || !selectedVehicle) return null;

  const today = new Date().toISOString().split('T')[0];
  const current = tireSets.find(item => item.is_installed);
  const others = tireSets.filter(item => !item.is_installed);
  const events = sortTireEvents(replacements.filter(isTireChange));
  const currentStatus = getTireStatusMeta(current?.status);

  const openCreateForm = () => {
    setEditingSet(null);
    setShowForm(true);
  };

  const openEditForm = (tireSet: TireSet) => {
    setEditingSet(tireSet);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSet(null);
  };

  const handleSubmit = async (payload: TireSetPayload) => {
    try {
      if (editingSet) {
        await api.updateTireSet(editingSet.id, payload);
        toast.success('Комплект обновлён');
      } else {
        await api.createTireSet(vehicleId, payload);
        toast.success(payload.install_now ? 'Комплект добавлен и установлен' : 'Комплект добавлен');
      }
      closeForm();
      onTireSetsUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось сохранить комплект');
    }
  };

  const handleDelete = async (tireSet: TireSet) => {
    if (tireSet.is_installed) {
      toast.error('Сначала переключитесь на другой комплект');
      return;
    }
    if (!confirm(`Удалить комплект «${tireSet.name}»? История покупки и установок сохранится в общей истории.`)) return;
    try {
      await api.deleteTireSet(tireSet.id);
      toast.success('Комплект удалён');
      onTireSetsUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось удалить комплект');
    }
  };

  const closeInstallForm = () => {
    if (!installing) setInstallTarget(null);
  };

  const handleInstall = async (payload: { work_price: number | null; next_change_date: string | null }) => {
    if (!installTarget) return;
    setInstalling(true);
    try {
      await api.installTireSet(vehicleId, installTarget.id, {
        work_price: payload.work_price,
        next_change_date: payload.next_change_date,
      });
      toast.success(`Установлены: ${installTarget.name}`);
      setInstallTarget(null);
      onTireSetsUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось переключить комплект');
    } finally {
      setInstalling(false);
    }
  };

  const handleDeleteEvent = async (event: Replacement) => {
    const message = event.tire_event_type === 'purchase'
      ? 'Удалить запись о покупке? Стоимость и дата покупки комплекта будут очищены.'
      : `Удалить запись из истории шин от ${event.replacement_date}?`;
    if (!confirm(message)) return;
    try {
      await api.deleteReplacement(event.id);
      toast.success('Запись удалена из истории');
      onTireSetsUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось удалить запись');
    }
  };

  return (
    <div className="md3-card overflow-hidden animate-fade-in">
      <VehicleCardHeader
        vehicle={selectedVehicle}
        title={`Шины: ${selectedVehicle.brand} ${selectedVehicle.model}`}
        onClose={onClose}
        onShare={onShare}
      />

      <div className="p-4 flex flex-col gap-4">
        {tireSets.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center">
              <span className="text-xl">🛞</span>
            </div>
            <p className="text-title-sm text-surface-on mb-1">Нет комплектов шин</p>
            <p className="text-body-md text-outline max-w-sm">
              Добавьте зимние и летние комплекты. Система будет отдельно считать пробег
              каждого комплекта и позволит переключаться между ними в один клик.
            </p>
          </div>
        ) : (
          <>
            {current ? (
              <div className="p-4 rounded-md3-md bg-primary-container text-primary-on-container">
                <p className="text-body-sm m-0 opacity-80">Сейчас установлены</p>
                <div className="flex items-center justify-between gap-3 flex-wrap mt-1">
                  <h3 className="text-title-md m-0">
                    {TIRE_SEASON_ICONS[current.season]} {current.name}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`md3-badge ${currentStatus.bgClass} ${currentStatus.textClass}`}>
                      {currentStatus.icon} {currentStatus.label}
                    </span>
                    <span className="md3-badge bg-surface text-surface-on">
                      {formatKm(current.total_km)}
                    </span>
                  </div>
                </div>
                <p className="text-body-sm m-0 mt-1 opacity-80">
                  {TIRE_SEASON_LABELS[current.season]}
                  {current.installed_date ? ` · установлены ${current.installed_date}` : ''}
                </p>
                {current.next_change_date && (
                  <p className="text-body-sm m-0 mt-1 opacity-80">
                    📅 Следующая смена: {current.next_change_date}
                  </p>
                )}
                {current.status && (
                  <p className="text-body-sm m-0 mt-1 opacity-80">
                    {tireStatusNote(current.status, current.days_remaining)}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-md3-md bg-surface-variant/60 text-surface-on-variant">
                <p className="text-body-md m-0">Сейчас ни один комплект не отмечен как установленный.</p>
              </div>
            )}

            {current && !current.next_change_date && (
              <div className="p-3 rounded-md3-sm bg-surface-variant/50 text-surface-on-variant">
                <p className="text-body-sm m-0">
                  ⚪ Дата следующей смены не задана. Укажите её в редактировании комплекта,
                  чтобы получать напоминания и видеть статус.
                </p>
              </div>
            )}

            {others.length > 0 && (
              <div>
                <p className="text-label-lg text-surface-on mb-2">Переключить на</p>
                <div className="flex flex-wrap gap-2">
                  {others.map(tireSet => (
                    <button
                      key={tireSet.id}
                      onClick={() => setInstallTarget(tireSet)}
                      disabled={installing}
                      className="md3-btn-tonal disabled:opacity-60"
                    >
                      {TIRE_SEASON_ICONS[tireSet.season]} {tireSet.name}
                    </button>
                  ))}
                </div>
                <p className="text-body-sm text-outline mt-2 mb-0">
                  Пробег текущего комплекта сохранится, а новый продолжит считать с текущего пробега авто.
                </p>
              </div>
            )}
          </>
        )}

        {tireSets.length > 0 && (
          <div>
            <p className="text-label-lg text-surface-on mb-2">Комплекты</p>
            <div className="flex flex-col gap-2">
              {tireSets.map(tireSet => (
                <div
                  key={tireSet.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-md3-sm bg-surface border border-outline-variant"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <p
                        className="text-label-lg text-surface-on m-0 truncate"
                        title={tireSet.name}
                      >
                        {TIRE_SEASON_ICONS[tireSet.season]} {tireSet.name}
                      </p>
                      {tireSet.is_installed && (
                        <span className="md3-badge bg-primary-container text-primary-on-container shrink-0">
                          установлены
                        </span>
                      )}
                    </div>
                    <p className="text-body-sm text-outline m-0">
                      {TIRE_SEASON_LABELS[tireSet.season]} · всего {formatKm(tireSet.total_km)}
                      {tireSet.accumulated_km > 0 && ` · прошлые сезоны ${formatKm(tireSet.accumulated_km)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditForm(tireSet)}
                      className="flex items-center justify-center w-8 h-8 rounded-md3-full text-surface-on-variant hover:bg-surface-variant transition-colors"
                      aria-label="Редактировать комплект"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(tireSet)}
                      disabled={tireSet.is_installed}
                      className="flex items-center justify-center w-8 h-8 rounded-md3-full text-error hover:bg-error-container transition-colors disabled:opacity-40"
                      aria-label="Удалить комплект"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {events.length > 0 && (
          <div>
            <p className="text-label-lg text-surface-on mb-2">История шин</p>
            <div className="flex flex-col gap-2">
              {events.map(event => (
                <div
                  key={event.id}
                  className="p-3 rounded-md3-sm bg-surface border border-outline-variant"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="text-label-lg text-surface-on m-0 min-w-0 truncate"
                      title={event.component_name}
                    >
                      {event.tire_event_type === 'purchase' ? '🧾' : '🛞'} {formatEventLabel(event)} · {event.component_name}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-body-sm text-outline">📅 {event.replacement_date}</span>
                      <button
                        onClick={() => handleDeleteEvent(event)}
                        className="flex items-center justify-center w-8 h-8 rounded-md3-full text-error hover:bg-error-container transition-colors"
                        aria-label="Удалить запись из истории шин"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-outline">
                    <span>📍 {event.km_at_replacement.toLocaleString()} км</span>
                    {event.component_price != null && event.component_price > 0 && (
                      <span>🧾 {formatTireMoney(event.component_price)}</span>
                    )}
                    {event.work_price != null && event.work_price > 0 && (
                      <span>🔧 Работа: {formatTireMoney(event.work_price)}</span>
                    )}
                    {event.next_change_date && <span>📅 До: {event.next_change_date}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <button onClick={openCreateForm} className="md3-btn-primary w-full">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Добавить комплект
          </button>
        </div>
      </div>

      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editingSet ? 'Редактировать комплект' : 'Новый комплект шин'}
      >
        <TireSetForm
          key={editingSet?.id ?? 'new'}
          initial={editingSet}
          today={today}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>

      <Modal
        isOpen={!!installTarget}
        onClose={closeInstallForm}
        title="Установка шин"
      >
        {installTarget && (
          <TireInstallForm
            tireSetName={installTarget.name}
            today={today}
            onSubmit={handleInstall}
            onCancel={closeInstallForm}
          />
        )}
      </Modal>
    </div>
  );
}
