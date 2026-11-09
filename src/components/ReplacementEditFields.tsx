import type { Repair, Replacement } from '../types';
import { isDateOnlyComponent } from '../utils/replacementTypes';
import type { ReplacementEditForm } from './ReplacementItem';

interface Props {
    replacement: Replacement;
    editForm: ReplacementEditForm;
    today: string;
    blockedByRepair?: Repair | null;
    onEditFormChange: (partial: Partial<ReplacementEditForm>) => void;
}

export function ReplacementEditFields({
    replacement,
    editForm,
    today,
    blockedByRepair,
    onEditFormChange,
}: Props) {
    const isDateOnly = isDateOnlyComponent(replacement.component_type);
    const isTire = replacement.component_type === 'tire_change';
    const isParking = replacement.component_type === 'parking_monthly';

    return (
        <>
            <div>
                <label className="block text-label-md text-surface-on-variant mb-1">Название</label>
                <input
                    type="text"
                    placeholder="Название"
                    value={editForm.component_name}
                    onChange={(event) => onEditFormChange({ component_name: event.target.value })}
                    className="md3-field"
                />
            </div>

            {isDateOnly ? (
                <>
                    <div>
                        <label className="block text-label-md text-surface-on-variant mb-1">Дата начала</label>
                        <input
                            type="date"
                            max={today}
                            value={editForm.replacement_date}
                            onChange={(event) => onEditFormChange({ replacement_date: event.target.value })}
                            className="md3-field"
                        />
                    </div>
                    <div>
                        <label className="block text-label-md text-surface-on-variant mb-1">Дата окончания</label>
                        <input
                            type="date"
                            value={editForm.next_change_date}
                            onChange={(event) => onEditFormChange({ next_change_date: event.target.value })}
                            className="md3-field"
                        />
                    </div>
                </>
            ) : isTire ? (
                <>
                    <div>
                        <label className="block text-label-md text-surface-on-variant mb-1">Пробег при установке (км)</label>
                        <input
                            type="number"
                            min="0"
                            placeholder="Пробег"
                            value={editForm.km_at_replacement}
                            onChange={(event) => onEditFormChange({ km_at_replacement: event.target.value })}
                            className="md3-field"
                        />
                    </div>
                    <div>
                        <label className="block text-label-md text-surface-on-variant mb-1">Дата замены</label>
                        <input
                            type="date"
                            max={today}
                            value={editForm.replacement_date}
                            onChange={(event) => onEditFormChange({ replacement_date: event.target.value })}
                            className="md3-field"
                        />
                    </div>
                    <div>
                        <label className="block text-label-md text-surface-on-variant mb-1">Дата следующей замены</label>
                        <input
                            type="date"
                            value={editForm.next_change_date}
                            onChange={(event) => onEditFormChange({ next_change_date: event.target.value })}
                            className="md3-field"
                        />
                    </div>
                </>
            ) : (
                <>
                    <div>
                        <label className="block text-label-md text-surface-on-variant mb-1">Пробег (км)</label>
                        <input
                            type="number"
                            min="0"
                            placeholder="Пробег"
                            value={editForm.km_at_replacement}
                            onChange={(event) => onEditFormChange({ km_at_replacement: event.target.value })}
                            className="md3-field"
                        />
                    </div>
                    <div>
                        <label className="block text-label-md text-surface-on-variant mb-1">Дата замены</label>
                        <input
                            type="date"
                            max={today}
                            value={editForm.replacement_date}
                            onChange={(event) => onEditFormChange({ replacement_date: event.target.value })}
                            className="md3-field"
                        />
                    </div>
                </>
            )}

            {isDateOnly ? (
                <div>
                    <label className="block text-label-md text-surface-on-variant mb-1">
                        {isParking ? 'Стоимость аренды (₽)' : 'Стоимость страховки (₽)'}
                    </label>
                    <input
                        type="number"
                        min="0"
                        placeholder={isParking ? '8000' : '12000'}
                        value={editForm.component_price}
                        onChange={(event) => onEditFormChange({ component_price: event.target.value })}
                        disabled={!!blockedByRepair}
                        className="md3-field"
                    />
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-label-md text-surface-on-variant mb-1">
                            {isTire ? 'Стоимость шин (₽)' : 'Цена (₽)'}
                        </label>
                        <input
                            type="number"
                            min="0"
                            placeholder="5000"
                            value={editForm.component_price}
                            onChange={(event) => onEditFormChange({ component_price: event.target.value })}
                            disabled={!!blockedByRepair}
                            className="md3-field"
                        />
                    </div>
                    <div>
                        <label className="block text-label-md text-surface-on-variant mb-1">Стоимость работ (₽)</label>
                        <input
                            type="number"
                            min="0"
                            placeholder="1500"
                            value={editForm.work_price}
                            onChange={(event) => onEditFormChange({ work_price: event.target.value })}
                            disabled={!!blockedByRepair}
                            className="md3-field"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
