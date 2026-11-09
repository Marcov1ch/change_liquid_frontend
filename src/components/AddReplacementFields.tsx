import type { Repair, Vehicle } from '../types';
import type { NewReplacementData } from './AddReplacementForm';

interface BaseProps {
    value: NewReplacementData;
    today: string;
    blockedByRepair?: Repair | null;
    onChange: (partial: Partial<NewReplacementData>) => void;
}

export function AddDateOnlyReplacementFields({
    value,
    today,
    blockedByRepair,
    onChange,
    isParking,
}: BaseProps & { isParking: boolean }) {
    return (
        <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-label-md text-surface-on-variant mb-1">Дата начала</label>
                    <input
                        type="date"
                        max={today}
                        value={value.replacement_date}
                        onChange={(event) => onChange({ replacement_date: event.target.value })}
                        className="md3-field"
                    />
                </div>
                <div>
                    <label className="block text-label-md text-surface-on-variant mb-1">Дата окончания *</label>
                    <input
                        type="date"
                        value={value.next_change_date}
                        onChange={(event) => onChange({ next_change_date: event.target.value })}
                        className="md3-field"
                    />
                </div>
            </div>
            <div>
                <label className="block text-label-md text-surface-on-variant mb-1">
                    {isParking ? 'Стоимость аренды (₽)' : 'Стоимость страховки (₽)'}
                </label>
                <input
                    type="number"
                    min="0"
                    placeholder={isParking ? '8000' : '12000'}
                    value={value.component_price === 0 ? '' : value.component_price}
                    onChange={(event) => onChange({
                        component_price: event.target.value === '' ? 0 : parseInt(event.target.value),
                    })}
                    disabled={!!blockedByRepair}
                    className="md3-field"
                />
            </div>
        </div>
    );
}

export function AddRegularReplacementFields({
    value,
    today,
    selectedVehicle,
    blockedByRepair,
    onChange,
}: BaseProps & { selectedVehicle: Vehicle | undefined }) {
    return (
        <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-label-md text-surface-on-variant mb-1">Цена (₽)</label>
                    <input
                        type="number"
                        min="0"
                        placeholder="5000"
                        value={value.component_price === 0 ? '' : value.component_price}
                        onChange={(event) => onChange({
                            component_price: event.target.value === '' ? 0 : parseInt(event.target.value),
                        })}
                        disabled={!!blockedByRepair}
                        className="md3-field"
                    />
                </div>
                <div>
                    <label className="block text-label-md text-surface-on-variant mb-1">Работа (₽)</label>
                    <input
                        type="number"
                        min="0"
                        placeholder="1500"
                        value={value.work_price === 0 ? '' : value.work_price}
                        onChange={(event) => onChange({
                            work_price: event.target.value === '' ? 0 : parseInt(event.target.value),
                        })}
                        disabled={!!blockedByRepair}
                        className="md3-field"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-label-md text-surface-on-variant mb-1">Пробег (км)</label>
                    <input
                        type="number"
                        placeholder={String(selectedVehicle?.current_km || 0)}
                        value={value.km_at_replacement === 0 ? '' : value.km_at_replacement}
                        onChange={(event) => onChange({
                            km_at_replacement: event.target.value === '' ? 0 : parseInt(event.target.value),
                        })}
                        className="md3-field"
                    />
                </div>
                <div>
                    <label className="block text-label-md text-surface-on-variant mb-1">Дата</label>
                    <input
                        type="date"
                        max={today}
                        value={value.replacement_date}
                        onChange={(event) => onChange({ replacement_date: event.target.value })}
                        className="md3-field"
                    />
                </div>
            </div>
        </div>
    );
}
