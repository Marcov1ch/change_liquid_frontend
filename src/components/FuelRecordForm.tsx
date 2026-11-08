import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import type { FuelRecord, FuelRecordPayload, Vehicle } from '../types';

interface Props {
  vehicle: Vehicle;
  initial?: FuelRecord | null;
  today: string;
  onSubmit: (payload: FuelRecordPayload) => Promise<void> | void;
  onCancel: () => void;
}

export function FuelRecordForm({ vehicle, initial, today, onSubmit, onCancel }: Props) {
  const { toast } = useToast();
  const [fuelDate, setFuelDate] = useState(initial?.fuel_date ?? today);
  const [kmAtFuel, setKmAtFuel] = useState(String(initial?.km_at_fuel ?? vehicle.current_km));
  const [liters, setLiters] = useState(initial ? String(initial.liters) : '');
  const [totalCost, setTotalCost] = useState(initial ? String(initial.total_cost) : '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const km = Number(kmAtFuel);
    if (!Number.isFinite(km) || km < 0) {
      toast.error('Пробег должен быть неотрицательным');
      return;
    }

    const parsedLiters = Number(liters);
    if (!Number.isFinite(parsedLiters) || parsedLiters <= 0) {
      toast.error('Объём топлива должен быть больше 0');
      return;
    }

    const parsedCost = Number(totalCost);
    if (totalCost === '' || !Number.isFinite(parsedCost) || parsedCost < 0) {
      toast.error('Укажите стоимость заправки');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        fuel_date: fuelDate,
        km_at_fuel: Math.round(km),
        liters: Math.round(parsedLiters * 1000) / 1000,
        total_cost: Math.round(parsedCost),
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
            value={fuelDate}
            onChange={(e) => setFuelDate(e.target.value)}
            className="md3-field"
          />
        </div>
        <div>
          <label className="block text-label-md text-surface-on-variant mb-1">Пробег, км *</label>
          <input
            type="number"
            min="0"
            value={kmAtFuel}
            onChange={(e) => setKmAtFuel(e.target.value)}
            className="md3-field"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-label-md text-surface-on-variant mb-1">Литры *</label>
          <input
            type="number"
            min="0.001"
            step="0.01"
            placeholder="35.5"
            value={liters}
            onChange={(e) => setLiters(e.target.value)}
            className="md3-field"
          />
        </div>
        <div>
          <label className="block text-label-md text-surface-on-variant mb-1">Стоимость, ₽ *</label>
          <input
            type="number"
            min="0"
            placeholder="2500"
            value={totalCost}
            onChange={(e) => setTotalCost(e.target.value)}
            className="md3-field"
          />
        </div>
      </div>

      <p className="text-body-sm text-outline m-0">
        Расход л/100 км рассчитывается автоматически между этой и предыдущей заправкой по пробегу.
      </p>

      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="md3-btn-text">
          Отмена
        </button>
        <button type="submit" disabled={submitting} className="md3-btn-primary">
          {submitting ? 'Сохранение...' : initial ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </form>
  );
}
