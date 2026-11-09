import type { ComponentConfig, Repair, Vehicle } from '../types';
import { isDateOnlyComponent } from '../utils/replacementTypes';
import {
    AddDateOnlyReplacementFields,
    AddRegularReplacementFields,
} from './AddReplacementFields';

export interface NewReplacementData {
    component_type: string;
    component_name: string;
    component_price: number;
    work_price: number;
    replacement_date: string;
    km_at_replacement: number;
    next_change_date: string;
}

interface Props {
    configs: ComponentConfig[];
    today: string;
    selectedVehicle: Vehicle | undefined;
    value: NewReplacementData;
    blockedByRepair?: Repair | null;
    onChange: (partial: Partial<NewReplacementData>) => void;
    onSubmit: () => void;
    onCancel: () => void;
}

export function AddReplacementForm({
    configs,
    today,
    selectedVehicle,
    value,
    blockedByRepair,
    onChange,
    onSubmit,
    onCancel,
}: Props) {
    const isDateOnly = isDateOnlyComponent(value.component_type);
    const isParking = value.component_type === 'parking_monthly';

    const namePlaceholder = isParking
        ? 'например: Машиноместо № 12 / № договора'
        : isDateOnly
            ? 'например: ОСАГО / Ингосстрах, № полиса'
            : `например: ${configs.find(c => c.key === value.component_type)?.example ?? 'Mobil 1 5W-30'}`;

    return (
        <div className="md3-elevated p-4">
            <h4 className="text-title-sm text-surface-on mb-4">Новая замена</h4>

            <div className="flex flex-col gap-3">
                <div>
                    <label className="block text-label-md text-surface-on-variant mb-1">Тип</label>
                    <select
                        value={value.component_type}
                        onChange={(event) => onChange({ component_type: event.target.value })}
                        className="md3-select"
                    >
                        {configs.map(config => (
                            <option key={config.key} value={config.key}>{config.name}</option>
                        ))}
                        <option value="insurance">Страховка</option>
                        <option value="parking_monthly">Аренда машиноместа</option>
                    </select>
                </div>

                <div>
                    <label className="block text-label-md text-surface-on-variant mb-1">Название *</label>
                    <input
                        type="text"
                        placeholder={namePlaceholder}
                        value={value.component_name}
                        onChange={(event) => onChange({ component_name: event.target.value })}
                        className="md3-field"
                    />
                </div>

                {isDateOnly ? (
                    <AddDateOnlyReplacementFields
                        value={value}
                        today={today}
                        blockedByRepair={blockedByRepair}
                        onChange={onChange}
                        isParking={isParking}
                    />
                ) : (
                    <AddRegularReplacementFields
                        value={value}
                        today={today}
                        selectedVehicle={selectedVehicle}
                        blockedByRepair={blockedByRepair}
                        onChange={onChange}
                    />
                )}

                {blockedByRepair && (
                    <div className="p-3 rounded-md3-sm bg-error-container text-error text-body-sm" role="alert">
                        На {blockedByRepair.repair_date} этот компонент входит в ремонт.
                        Стоимость уже учтена в ремонте, поэтому поля цены недоступны.
                    </div>
                )}

                <div className="p-3 rounded-md3-sm bg-surface-variant/50 text-body-sm text-outline">
                    {isParking
                        ? '💡 Укажите дату начала и окончания аренды — за 1 день до окончания придёт уведомление.'
                        : isDateOnly
                            ? '💡 Укажите дату окончания страховки — за 5 дней до неё придёт уведомление. Пробег и стоимость работ для страховки не используются.'
                            : '💡 Дату следующей замены система рассчитает сама из настроек авто (интервал в месяцах). Поля с ценой можно оставить пустыми.'}
                </div>

                <div className="flex gap-3 pt-1">
                    <button onClick={onSubmit} className="md3-btn-primary flex-1">Сохранить</button>
                    <button onClick={onCancel} className="md3-btn-text flex-1">Отмена</button>
                </div>
            </div>
        </div>
    );
}
