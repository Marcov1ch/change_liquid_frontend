import { Modal } from './Modal';
import { useToast } from '../context/ToastContext';
import { VehicleFields } from './VehicleFields';
import { useVehicleForm } from '../hooks/useVehicleForm';
import type { VehicleFormData } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vehicle: VehicleFormData) => Promise<void>;
}

export function VehicleForm({ isOpen, onClose, onSubmit }: Props) {
  const { toast } = useToast();
  const form = useVehicleForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    try {
      await onSubmit({
        ...form.formData,
        intervals: form.intervals,
        notify_flags: form.notifyFlags,
      });
      form.resetForm();
    } catch {
      // handled in parent
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Добавить автомобиль">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <VehicleFields form={form} />

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="md3-btn-text">Отмена</button>
          <button type="submit" className="md3-btn-primary">Добавить</button>
        </div>
      </form>
    </Modal>
  );
}
