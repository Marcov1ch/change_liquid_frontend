import { useState } from 'react';
import { useToast } from '../context/ToastContext';

interface Props {
  tireSetName: string;
  today: string;
  onSubmit: (payload: { work_price: number | null; next_change_date: string | null }) => Promise<void> | void;
  onCancel: () => void;
}

export function TireInstallForm({ tireSetName, today, onSubmit, onCancel }: Props) {
  const { toast } = useToast();
  const [workPrice, setWorkPrice] = useState('');
  const [nextChangeDate, setNextChangeDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (nextChangeDate && nextChangeDate < today) {
      toast.error('Дата следующей смены не может быть раньше сегодняшней');
      return;
    }

    let parsedPrice: number | null = null;
    if (workPrice.trim() !== '') {
      const value = Number(workPrice);
      if (!Number.isFinite(value) || value < 0) {
        toast.error('Стоимость работ должна быть неотрицательной');
        return;
      }
      parsedPrice = Math.round(value);
    }

    setSubmitting(true);
    try {
      await onSubmit({
        work_price: parsedPrice,
        next_change_date: nextChangeDate || null,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-body-md text-surface-on m-0">
        Установка комплекта: <strong>{tireSetName}</strong>
      </p>

      <div>
        <label className="block text-label-md text-surface-on-variant mb-1">Стоимость работ, ₽</label>
        <input
          type="number"
          min="0"
          step="1"
          placeholder="0"
          value={workPrice}
          onChange={(e) => setWorkPrice(e.target.value)}
          className="md3-field"
        />
      </div>

      <div>
        <label className="block text-label-md text-surface-on-variant mb-1">Дата следующей смены</label>
        <input
          type="date"
          min={today}
          value={nextChangeDate}
          onChange={(e) => setNextChangeDate(e.target.value)}
          className="md3-field"
        />
      </div>

      <p className="text-body-sm text-outline m-0">
        Стоимость работ можно оставить пустой или указать 0, если переобуваете автомобиль самостоятельно.
        За 5 дней до даты следующей смены придёт уведомление.
      </p>

      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="md3-btn-text">
          Отмена
        </button>
        <button type="submit" disabled={submitting} className="md3-btn-primary">
          {submitting ? 'Установка...' : 'Установить'}
        </button>
      </div>
    </form>
  );
}
