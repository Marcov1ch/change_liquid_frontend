import { useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import type { Replacement, TireSet, TireSetPayload, Vehicle } from '../types';
import { isTireChange, sortTireEvents } from '../utils/tireSets';
import { Modal } from './Modal';
import { TireHistoryList } from './TireHistoryList';
import { TireInstallForm } from './TireInstallForm';
import { TireSetCurrentCard } from './TireSetCurrentCard';
import { TireSetForm } from './TireSetForm';
import { TireSetList } from './TireSetList';
import { TireSetSwitchSection } from './TireSetSwitchSection';
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
  const current = tireSets.find(item => item.is_installed) ?? null;
  const others = tireSets.filter(item => !item.is_installed);
  const events = sortTireEvents(replacements.filter(isTireChange));

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
            <TireSetCurrentCard current={current} />
            <TireSetSwitchSection
              tireSets={others}
              installing={installing}
              onInstall={setInstallTarget}
            />
          </>
        )}

        <TireSetList tireSets={tireSets} onEdit={openEditForm} onDelete={handleDelete} />
        <TireHistoryList events={events} onDelete={handleDeleteEvent} />

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
