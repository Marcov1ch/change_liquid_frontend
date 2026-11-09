import type { Repair, Replacement } from '../types';
import {
    getReplacementDateReminder,
    getReplacementStatusLabel,
} from '../utils/replacementDisplay';
import { getDateWarningDays, isDateOnlyComponent } from '../utils/replacementTypes';
import { ReplacementEditFields } from './ReplacementEditFields';
import { ReplacementMeta } from './ReplacementMeta';

const REPAIR_PLACEHOLDER_NAME = 'ВНЕСИТЕ ИЗМЕНЕНИЕ';

export interface ReplacementEditForm {
    km_at_replacement: string;
    replacement_date: string;
    component_name: string;
    next_change_date: string;
    component_price: string;
    work_price: string;
}

interface Props {
    replacement: Replacement;
    isFirst: boolean;
    itemStyle: { bg: string; text: string; border: string; icon: string };
    editing: boolean;
    editForm: ReplacementEditForm;
    today: string;
    kmTraveled: number;
    blockedByRepair?: Repair | null;
    onEditFormChange: (partial: Partial<ReplacementEditForm>) => void;
    onStartEdit: () => void;
    onCancelEdit: () => void;
    onSaveEdit: () => void;
    onDelete: () => void;
}

export function ReplacementItem({
    replacement,
    isFirst,
    itemStyle,
    editing,
    editForm,
    today,
    kmTraveled,
    blockedByRepair,
    onEditFormChange,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onDelete,
}: Props) {
    const isTire = replacement.component_type === 'tire_change';
    const isDateOnly = isDateOnlyComponent(replacement.component_type);
    const isParking = replacement.component_type === 'parking_monthly';
    const warningDays = getDateWarningDays(replacement.component_type);
    const label = getReplacementStatusLabel(replacement);
    const dateReminder = getReplacementDateReminder(replacement);

    return (
        <div className={`p-3 rounded-md3-sm border-l-4 ${itemStyle.border} bg-surface transition-shadow duration-200 hover:shadow-md3-1`}>
            {editing ? (
                <div className="flex flex-col gap-3">
                    <ReplacementEditFields
                        replacement={replacement}
                        editForm={editForm}
                        today={today}
                        blockedByRepair={blockedByRepair}
                        onEditFormChange={onEditFormChange}
                    />

                    {blockedByRepair && (
                        <div className="p-3 rounded-md3-sm bg-error-container text-error text-body-sm" role="alert">
                            Компонент входит в ремонт от {blockedByRepair.repair_date}.
                            Стоимость уже учтена в ремонте — поля цены недоступны.
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button onClick={onSaveEdit} className="md3-btn-primary !py-2 !px-4 !rounded-md3-sm text-label-sm flex-1">
                            Сохранить
                        </button>
                        <button onClick={onCancelEdit} className="md3-btn-text !py-2 !px-4 !rounded-md3-sm text-label-sm">
                            Отмена
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-2 min-w-0">
                        {isFirst && <span className="text-label-md">{itemStyle.icon}</span>}
                        <span className="text-label-lg text-surface-on">{replacement.component_name}</span>
                        {isFirst && (
                            <span className="md3-badge bg-primary-container text-primary-on-container">
                                последняя
                            </span>
                        )}
                        {replacement.source_repair_id && replacement.component_name === REPAIR_PLACEHOLDER_NAME && (
                            <span className="md3-badge bg-surface-variant text-surface-on-variant">
                                из ремонта
                            </span>
                        )}
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                        <ReplacementMeta
                            replacement={replacement}
                            isDateOnly={isDateOnly}
                            isTire={isTire}
                            isParking={isParking}
                            kmTraveled={kmTraveled}
                            warningDays={warningDays}
                        />
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
