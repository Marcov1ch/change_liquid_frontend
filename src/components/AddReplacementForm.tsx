import type { ComponentConfig, Vehicle } from '../types';

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
    onChange: (partial: Partial<NewReplacementData>) => void;
    onSubmit: () => void;
    onCancel: () => void;
}

export function AddReplacementForm({ configs, today, selectedVehicle, value, onChange, onSubmit, onCancel }: Props) {
    const isTire = value.component_type === 'tire_change';

    return (
        <div className="md3-elevated p-4">
            <h4 className="text-title-sm text-surface-on mb-4">Новая замена</h4>

            <div className="flex flex-col gap-3">
                <div>
                    <label className="block text-label-md text-surface-on-variant mb-1">Тип</label>
                    <select
                        value={value.component_type}
                        onChange={(e) => onChange({ component_type: e.target.value })}
                        className="md3-select"
                    >
                        {configs.map(cfg => (
                            <option key={cfg.key} value={cfg.key}>{cfg.name}</option>
                        ))}
                        <option value="tire_change">Шины</option>
                    </select>
                </div>

                <div>
                    <label className="block text-label-md text-surface-on-variant mb-1">Название *</label>
                    <input
                        type="text"
                        placeholder={isTire ? 'например: Зимняя резина Michelin / № Договора хранения' : `например: ${configs.find(c => c.key === value.component_type)?.example ?? 'Mobil 1 5W-30'}`}
                        value={value.component_name}
                        onChange={(e) => onChange({ component_name: e.target.value })}
                        className="md3-field"
                    />
                </div>

                {isTire ? (
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-label-md text-surface-on-variant mb-1">Дата замены</label>
                            <input
                                type="date"
                                max={today}
                                value={value.replacement_date}
                                onChange={(e) => onChange({ replacement_date: e.target.value })}
                                className="md3-field"
                            />
                        </div>
                        <div>
                            <label className="block text-label-md text-surface-on-variant mb-1">Дата след. замены *</label>
                            <input
                                type="date"
                                value={value.next_change_date}
                                onChange={(e) => onChange({ next_change_date: e.target.value })}
                                className="md3-field"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-label-md text-surface-on-variant mb-1">Цена (₽)</label>
                            <input
                                type="number"
                                placeholder="5000"
                                value={value.component_price === 0 ? '' : value.component_price}
                                onChange={(e) => onChange({ component_price: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                                className="md3-field"
                            />
                        </div>
                        <div>
                            <label className="block text-label-md text-surface-on-variant mb-1">Работа (₽)</label>
                            <input
                                type="number"
                                placeholder="1500"
                                value={value.work_price === 0 ? '' : value.work_price}
                                onChange={(e) => onChange({ work_price: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                                className="md3-field"
                            />
                        </div>
                    </div>
                )}

                {!isTire && (
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-label-md text-surface-on-variant mb-1">Пробег (км)</label>
                            <input
                                type="number"
                                placeholder={String(selectedVehicle?.current_km || 0)}
                                value={value.km_at_replacement === 0 ? '' : value.km_at_replacement}
                                onChange={(e) => onChange({ km_at_replacement: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                                className="md3-field"
                            />
                        </div>
                        <div>
                            <label className="block text-label-md text-surface-on-variant mb-1">Дата</label>
                            <input
                                type="date"
                                max={today}
                                value={value.replacement_date}
                                onChange={(e) => onChange({ replacement_date: e.target.value })}
                                className="md3-field"
                            />
                        </div>
                    </div>
                )}

                <div className="p-3 rounded-md3-sm bg-surface-variant/50 text-body-sm text-outline">
                    {isTire
                        ? '💡 Укажите дату окончания хранения шин — за 5 дней до неё придёт уведомление.'
                        : '💡 Поля с ценой можно оставить пустыми'}
                </div>

                <div className="flex gap-3 pt-1">
                    <button onClick={onSubmit} className="md3-btn-primary flex-1">Сохранить</button>
                    <button onClick={onCancel} className="md3-btn-text flex-1">Отмена</button>
                </div>
            </div>
        </div>
    );
}
