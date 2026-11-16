import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import type { Vehicle } from '../../types';
import { validateKmUpdate } from '../../utils/quickAdd';

interface Props {
  vehicle: Vehicle;
  onSubmit: (newKm: number) => Promise<void> | void;
  onCancel: () => void;
}

export function QuickAddKmForm({ vehicle, onSubmit, onCancel }: Props) {
  const { toast } = useToast();
  const [value, setValue] = useState(String(vehicle.current_km));
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = validateKmUpdate(vehicle.current_km, value);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(result.newKm);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="text-label-md text-surface-on-variant">
        Новый пробег, км
        <input
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="md3-field mt-1"
          autoFocus
        />
      </label>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="md3-btn-text">Отмена</button>
        <button type="submit" disabled={submitting} className="md3-btn-primary">
          {submitting ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </form>
  );
}
