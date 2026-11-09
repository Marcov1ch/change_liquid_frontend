import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import type { TireSeason, TireSet, TireSetPayload } from '../types';
import { TIRE_SEASON_LABELS } from '../utils/tireSets';

interface Props {
  initial?: TireSet | null;
  today: string;
  onSubmit: (payload: TireSetPayload) => Promise<void> | void;
  onCancel: () => void;
}

const SEASONS: TireSeason[] = ['winter', 'summer', 'all_season'];

export function TireSetForm({ initial, today, onSubmit, onCancel }: Props) {
  const { toast } = useToast();
  const [name, setName] = useState(initial?.name ?? '');
  const [season, setSeason] = useState<TireSeason>(initial?.season ?? 'winter');
  const [purchaseDate, setPurchaseDate] = useState(initial?.purchase_date ?? '');
  const [purchasePrice, setPurchasePrice] = useState(
    initial?.purchase_price != null ? String(initial.purchase_price) : '',
  );
  const [installNow, setInstallNow] = useState(!initial);
  const [workPrice, setWorkPrice] = useState('');
  const [nextChangeDate, setNextChangeDate] = useState(initial?.next_change_date ?? '');
  const [submitting, setSubmitting] = useState(false);

  const showNextDate = initial ? initial.is_installed : installNow;
  const nextDateMin = initial?.installed_date || today;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Введите название комплекта');
      return;
    }
    if (purchaseDate && purchaseDate > today) {
      toast.error('Дата покупки не может быть позже сегодняшней');
      return;
    }
    if (showNextDate && nextChangeDate && nextChangeDate < nextDateMin) {
      toast.error(
        initial
          ? 'Дата следующей смены не может быть раньше даты установки'
          : 'Дата следующей смены не может быть раньше сегодняшней',
      );
      return;
    }

    let parsedPrice: number | null = initial ? 0 : null;
    if (purchasePrice.trim() !== '') {
      const value = Number(purchasePrice);
      if (!Number.isFinite(value) || value < 0) {
        toast.error('Стоимость покупки должна быть неотрицательной');
        return;
      }
      parsedPrice = Math.round(value);
    }

    let parsedWorkPrice: number | null = null;
    if (!initial && installNow && workPrice.trim() !== '') {
      const value = Number(workPrice);
      if (!Number.isFinite(value) || value < 0) {
        toast.error('Стоимость работ должна быть неотрицательной');
        return;
      }
      parsedWorkPrice = Math.round(value);
    }

    setSubmitting(true);
    try {
      const payload: TireSetPayload = {
        name: trimmedName,
        season,
        purchase_date: purchaseDate || null,
        purchase_price: parsedPrice,
      };
      if (!initial) {
        payload.install_now = installNow;
        payload.work_price = installNow ? parsedWorkPrice : null;
      }
      if (showNextDate) {
        payload.next_change_date = nextChangeDate || null;
      }
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-label-md text-surface-on-variant mb-1">Название *</label>
        <input
          type="text"
          placeholder="Например: Зимние Michelin"
          value={name}
          maxLength={100}
          onChange={(e) => setName(e.target.value)}
          className="md3-field"
        />
      </div>

      <div>
        <label className="block text-label-md text-surface-on-variant mb-1">Сезон</label>
        <select
          value={season}
          onChange={(e) => setSeason(e.target.value as TireSeason)}
          className="md3-select"
        >
          {SEASONS.map(value => (
            <option key={value} value={value}>{TIRE_SEASON_LABELS[value]}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-label-md text-surface-on-variant mb-1">Дата покупки</label>
          <input
            type="date"
            max={today}
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="md3-field"
          />
        </div>
        <div>
          <label className="block text-label-md text-surface-on-variant mb-1">Стоимость, ₽</label>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="30000"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            className="md3-field"
          />
        </div>
      </div>

      {!initial && (
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer p-2 rounded-md3-xs hover:bg-surface-variant/40 transition-colors">
            <input
              type="checkbox"
              checked={installNow}
              onChange={(e) => setInstallNow(e.target.checked)}
              className="w-5 h-5 rounded-md3-xs accent-primary"
            />
            <span className="text-body-md text-surface-on">Установить сразу после добавления</span>
          </label>

          {installNow && (
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
          )}
        </div>
      )}

      {showNextDate && (
        <div>
          <label className="block text-label-md text-surface-on-variant mb-1">Дата следующей смены</label>
          <input
            type="date"
            min={nextDateMin}
            value={nextChangeDate}
            onChange={(e) => setNextChangeDate(e.target.value)}
            className="md3-field"
          />
          <p className="text-body-sm text-outline mt-1 mb-0">
            За 5 дней до этой даты придёт уведомление о скорой замене.
          </p>
        </div>
      )}

      <p className="text-body-sm text-outline m-0">
        Стоимость покупки учитывается в статистике один раз — в месяц покупки.
        {!initial && installNow
          ? ' Стоимость работ добавится в статистику в дату установки.'
          : ' Стоимость работ по установке указывается при переключении.'}
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
