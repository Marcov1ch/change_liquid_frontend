import type { Replacement } from '../types';

export interface ReplacementEditForm {
    km_at_replacement: string;
    replacement_date: string;
    component_name: string;
    next_change_date: string;
}

interface Props {
    replacement: Replacement;
    isFirst: boolean;
    itemStyle: { bg: string; text: string; border: string; icon: string };
    editing: boolean;
    editForm: ReplacementEditForm;
    today: string;
    onEditFormChange: (partial: Partial<ReplacementEditForm>) => void;
    onStartEdit: () => void;
    onCancelEdit: () => void;
    onSaveEdit: () => void;
    onDelete: () => void;
}

function statusLabel(
    status: string | undefined,
    kmRemaining: number | undefined,
    daysRemaining: number | null | undefined,
    isTire: boolean,
): string | null {
    if (isTire) {
        if (daysRemaining == null) return null;
        if (daysRemaining < 0) return `Просрочено на ${-daysRemaining} дн.`;
        if (daysRemaining <= 5) return `Скоро замена: осталось ${daysRemaining} дн.`;
        return null;
    }
    if (status === 'replaced') return 'Заменено';
    if (kmRemaining == null) return null;
    if (status === 'overdue') return `Просрочено на ${Math.abs(kmRemaining).toLocaleString()} км`;
    if (status === 'critical' || status === 'warning') return `Осталось ${kmRemaining.toLocaleString()} км`;
    return null;
}

export function ReplacementItem({
    replacement: r,
    isFirst,
    itemStyle,
    editing,
    editForm,
    today,
    onEditFormChange,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onDelete,
}: Props) {
    const isTire = r.component_type === 'tire_change';
    const label = statusLabel(r.status, r.km_remaining, r.days_remaining, isTire);

    let dateReminder: string | null = null;
    if (!isTire && r.next_change_date && r.days_remaining != null) {
        if (r.days_remaining < 0) {
            dateReminder = `⏳ Просрочено по дате на ${-r.days_remaining} дн.`;
        } else if (r.days_remaining <= 5) {
            dateReminder = `⏳ Замена по дате через ${r.days_remaining} дн.`;
        }
    }

    return (
        <div className={`p-3 rounded-md3-sm border-l-4 ${itemStyle.border} bg-surface transition-shadow duration-200 hover:shadow-md3-1`}>
            {editing ? (
                <div className="flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="Название"
                        value={editForm.component_name}
                        onChange={(e) => onEditFormChange({ component_name: e.target.value })}
                        className="md3-field"
                    />
                    {isTire ? (
                        <>
                            <input
                                type="date"
                                max={today}
                                value={editForm.replacement_date}
                                onChange={(e) => onEditFormChange({ replacement_date: e.target.value })}
                                className="md3-field"
                            />
                            <input
                                type="date"
                                value={editForm.next_change_date}
                                onChange={(e) => onEditFormChange({ next_change_date: e.target.value })}
                                className="md3-field"
                            />
                        </>
                    ) : (
                        <>
                            <input
                                type="number"
                                placeholder="Пробег"
                                value={editForm.km_at_replacement}
                                onChange={(e) => onEditFormChange({ km_at_replacement: e.target.value })}
                                className="md3-field"
                            />
                            <input
                                type="date"
                                max={today}
                                value={editForm.replacement_date}
                                onChange={(e) => onEditFormChange({ replacement_date: e.target.value })}
                                className="md3-field"
                            />
                        </>
                    )}
                    <div className="flex gap-2">
                        <button onClick={onSaveEdit} className="md3-btn-primary !py-2 !px-4 !rounded-md3-sm text-label-sm flex-1">Сохранить</button>
                        <button onClick={onCancelEdit} className="md3-btn-text !py-2 !px-4 !rounded-md3-sm text-label-sm">Отмена</button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-2 min-w-0">
                        {isFirst && <span className="text-label-md">{itemStyle.icon}</span>}
                        <span className="text-label-lg text-surface-on">{r.component_name}</span>
                        {isFirst && <span className="md3-badge bg-primary-container text-primary-on-container">последняя</span>}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-outline">
                            <span>📅 {r.replacement_date}</span>
                            {isTire ? (
                                <>
                                    {r.next_change_date && <span>⏱ До: {r.next_change_date}</span>}
                                    {r.days_remaining != null && (
                                        <span className={r.days_remaining <= 5 ? 'text-error font-semibold' : ''}>
                                            ⏳ {r.days_remaining} дн.
                                        </span>
                                    )}
                                </>
                            ) : (
                                <>
                                    <span>📍 {r.km_at_replacement.toLocaleString()} км</span>
                                    {r.next_replacement_km != null && (
                                        <span>⏱ Следующая: {r.next_replacement_km.toLocaleString()} км</span>
                                    )}
                                    {r.next_change_date && <span>📅 До: {r.next_change_date}</span>}
                                </>
                            )}
                        </div>
                        <div className="flex gap-0">
                            <button
                                onClick={onStartEdit}
                                className="flex items-center justify-center w-8 h-8 rounded-md3-full text-[#7A6100] hover:bg-[#FFF8E1] transition-colors"
                                aria-label="Редактировать"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            </button>
                            <button
                                onClick={onDelete}
                                className="flex items-center justify-center w-8 h-8 rounded-md3-full text-error hover:bg-error-container transition-colors"
                                aria-label="Удалить"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    {label && (
                        <p className={`mt-1 text-body-sm ${itemStyle.text}`}>{label}</p>
                    )}
                    {dateReminder && (
                        <p className="mt-1 text-body-sm text-[#7A6100]">{dateReminder}</p>
                    )}
                </>
            )}
        </div>
    );
}
