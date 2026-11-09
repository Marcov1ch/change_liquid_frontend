import type { PublicOtherExpense } from '../../types';
import { formatPublicMoney } from '../../utils/publicVehicle';

interface Props {
    expenses: PublicOtherExpense[];
}

export function PublicOtherExpensesSection({ expenses }: Props) {
    return (
        <div className="md3-card p-6">
            <h2 className="text-title-md text-surface-on mb-4">Прочие траты</h2>

            {expenses.length === 0 ? (
                <p className="text-body-md text-outline">Прочих трат пока нет.</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {expenses.map(expense => (
                        <div
                            key={expense.id}
                            className="flex items-center justify-between gap-3 p-3 rounded-md3-sm bg-surface border border-outline-variant"
                        >
                            <div className="min-w-0">
                                <p className="text-label-lg text-surface-on m-0 truncate">
                                    {expense.name}
                                </p>
                                <p className="text-body-sm text-outline m-0">
                                    📅 {expense.expense_date}
                                </p>
                            </div>
                            <span className="text-title-sm text-surface-on shrink-0">
                                {formatPublicMoney(expense.amount)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
