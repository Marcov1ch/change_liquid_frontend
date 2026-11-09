import { api } from '../api/client';
import { useCrudList } from '../hooks/useCrudList';
import type { OtherExpense, OtherExpensePayload, Vehicle } from '../types';
import { Modal } from './Modal';
import { OtherExpenseForm } from './OtherExpenseForm';
import { VehicleCardHeader } from './VehicleCardHeader';

interface Props {
  expenses: OtherExpense[];
  vehicleId: number | null;
  selectedVehicle: Vehicle | undefined;
  onClose: () => void;
  onShare: () => void;
  onExpensesUpdate: () => void;
}

function formatMoney(value: number): string {
  return `${value.toLocaleString()} ₽`;
}

export function OtherExpensesList({ expenses, vehicleId, selectedVehicle, onClose, onShare, onExpensesUpdate }: Props) {
  const {
    showForm,
    editing,
    openCreateForm,
    openEditForm,
    closeForm,
    handleSubmit,
    handleDelete,
  } = useCrudList<OtherExpense, OtherExpensePayload>({
    vehicleId,
    create: api.createOtherExpense,
    update: api.updateOtherExpense,
    remove: api.deleteOtherExpense,
    onChanged: onExpensesUpdate,
    createSuccess: 'Трата добавлена',
    updateSuccess: 'Трата обновлена',
    saveError: 'Не удалось сохранить трату',
    deleteSuccess: 'Трата удалена',
    deleteError: 'Не удалось удалить трату',
    getDeleteConfirm: expense => `Удалить трату «${expense.name}»?`,
  });

  if (!vehicleId || !selectedVehicle) return null;

  const today = new Date().toISOString().split('T')[0];
  const sortedExpenses = [...expenses].sort((a, b) => {
    const dateDiff = new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return b.id - a.id;
  });
  const total = sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="md3-card overflow-hidden animate-fade-in">
      <VehicleCardHeader
        vehicle={selectedVehicle}
        title={`Прочие траты: ${selectedVehicle.brand} ${selectedVehicle.model}`}
        onClose={onClose}
        onShare={onShare}
      />

      <div className="p-4">
        {sortedExpenses.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center">
              <span className="text-xl">💸</span>
            </div>
            <p className="text-title-sm text-surface-on mb-1">Нет прочих трат</p>
            <p className="text-body-md text-outline max-w-sm">
              Сюда можно записать штраф, мойку, почасовую парковку. Все, что хотите учитывать
              при использовании авто и что будет подсчитываться в тратах на выбранный автомобиль.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sortedExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between gap-3 p-3 rounded-md3-sm bg-surface border border-outline-variant">
                <div className="min-w-0">
                  <p className="text-label-lg text-surface-on m-0 truncate">{expense.name}</p>
                  <p className="text-body-sm text-outline m-0">📅 {expense.expense_date}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-title-sm text-surface-on">{formatMoney(expense.amount)}</span>
                  <button
                    onClick={() => openEditForm(expense)}
                    className="flex items-center justify-center w-8 h-8 rounded-md3-full text-surface-on-variant hover:bg-surface-variant transition-colors"
                    aria-label="Редактировать трату"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(expense)}
                    className="flex items-center justify-center w-8 h-8 rounded-md3-full text-error hover:bg-error-container transition-colors"
                    aria-label="Удалить трату"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {sortedExpenses.length > 0 && (
          <div className="mt-4 pt-4 border-t border-outline-variant flex items-center justify-between">
            <span className="text-label-lg text-surface-on-variant">Итого прочих трат</span>
            <span className="text-title-md text-surface-on">{formatMoney(total)}</span>
          </div>
        )}

        <div className="mt-4">
          <button onClick={openCreateForm} className="md3-btn-primary w-full">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Добавить трату
          </button>
        </div>
      </div>

      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editing ? 'Редактировать трату' : 'Новая трата'}
      >
        <OtherExpenseForm
          key={editing?.id ?? 'new'}
          initial={editing}
          today={today}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>
    </div>
  );
}
