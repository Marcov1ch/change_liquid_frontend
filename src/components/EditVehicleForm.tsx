import { Modal } from './Modal';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { VehicleFields } from './VehicleFields';
import { useVehicleForm } from '../hooks/useVehicleForm';
import type { Vehicle } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onUpdate: () => void;
  onDelete: (id: number) => Promise<void>;
}

export function EditVehicleForm({ isOpen, onClose, vehicle, onUpdate, onDelete }: Props) {
  const { toast } = useToast();
  const form = useVehicleForm({ vehicle });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    if (!vehicle) return;

    try {
      await api.updateVehicle(vehicle.id, {
        ...form.formData,
        intervals: form.intervals,
        notify_flags: form.notifyFlags,
        interval_months: form.intervalMonths,
      });
      toast.success('Автомобиль обновлён');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось обновить автомобиль');
    }
  };

  const handleDelete = async () => {
    if (!vehicle) return;
    if (!confirm('Удалить автомобиль? (можно будет восстановить)')) return;
    await onDelete(vehicle.id);
    toast.success('Автомобиль удалён');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Настройки">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <VehicleFields form={form} collapsible yearKmInline />

        <hr className="md3-divider" />

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleDelete}
            className="md3-btn-danger w-full"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Удалить автомобиль
          </button>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="md3-btn-text">Отмена</button>
          <button type="submit" className="md3-btn-primary">Сохранить</button>
        </div>
      </form>
    </Modal>
  );
}
