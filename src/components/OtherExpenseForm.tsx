import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import type { OtherExpense, OtherExpensePayload } from '../types';

interface Props {
  initial?: OtherExpense | null;
  today: string;
  onSubmit: (payload: OtherExpensePayload) => Promise<void> | void;
  onCancel: () => void;
}

export function OtherExpenseForm({ initial, today, onSubmit, onCancel }: Props) {
  const { toast } = useToast();
  const [name, setName] = useState(initial?.name ?? '');
  const [expenseDate, setExpenseDate] = useState(initial?.expense_date ?? today);
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Введите название траты');
      return;
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error('Стоимость должна быть больше 0');
      return;
    }

    if (expenseDate > today) {
      toast.error('Дата не может быть позже сегодняшней');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: trimmedName,
        expense_date: expenseDate,
        amount: Math.round(parsedAmount),
      });
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
          placeholder="Например: штраф, мойка, парковка"
          value={name}
          maxLength={100}
          onChange={(e) => setName(e.target.value)}
          className="md3-field"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-label-md text-surface-on-variant mb-1">Дата *</label>
          <input
            type="date"
            max={today}
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="md3-field"
          />
        </div>
        <div>
          <label className="block text-label-md text-surface-on-variant mb-1">Сумма, ₽ *</label>
          <input
            type="number"
            min="1"
            step="1"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="md3-field"
          />
        </div>
      </div>

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
