import type { useVehicleForm } from '../hooks/useVehicleForm';
import { Spoiler } from './Spoiler';

type VehicleFormModel = ReturnType<typeof useVehicleForm>;

interface Props {
    form: VehicleFormModel;
    collapsible?: boolean;
    yearKmInline?: boolean;
}

export function VehicleFields({ form, collapsible = false, yearKmInline = false }: Props) {
    const {
        formData, setFormData, setYearError,
        intervals, notifyFlags, intervalMonths,
        plateError, yearError,
        brands, models, configs,
        handlePlateChange, handleIntervalChange, handleIntervalMonthsChange, handleNotifyChange,
    } = form;

    const yearInput = (
        <div>
            <label className="block text-label-lg text-surface-on mb-2">Год выпуска</label>
            <input
                type="number"
                value={formData.year === 0 ? '' : formData.year}
                onChange={(e) => { setFormData(prev => ({ ...prev, year: e.target.value === '' ? 0 : e.target.valueAsNumber })); setYearError(''); }}
                placeholder={String(new Date().getFullYear())}
                required
                className={`md3-field ${yearError ? 'md3-field-error' : ''}`}
            />
            {yearError && <p className="mt-1 text-body-sm text-error">{yearError}</p>}
        </div>
    );

    const kmInput = (
        <div>
            <label className="block text-label-lg text-surface-on mb-2">Пробег (км)</label>
            <input
                type="number"
                value={formData.current_km === 0 ? '' : formData.current_km}
                onChange={(e) => setFormData(prev => ({ ...prev, current_km: e.target.value === '' ? 0 : e.target.valueAsNumber }))}
                placeholder="0"
                required
                className="md3-field"
            />
        </div>
    );

    const intervalsSection = (
        <div className={collapsible ? 'flex flex-col gap-4 pt-3' : 'flex flex-col gap-4'}>
            {configs.map(cfg => (
                <div key={cfg.key} className="flex items-center gap-3">
                    <label className="block text-body-md text-surface-on-variant flex-1">{cfg.name}</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            title="Интервал замены (км)"
                            value={intervals[cfg.key] ?? cfg.default_interval}
                            onChange={(e) => handleIntervalChange(cfg.key, parseInt(e.target.value))}
                            className="md3-field !w-24"
                        />
                        <input
                            type="number"
                            title="Интервал замены (месяцев)"
                            placeholder="мес"
                            value={intervalMonths[cfg.key] ?? ''}
                            onChange={(e) => handleIntervalMonthsChange(
                                cfg.key,
                                e.target.value === '' ? null : parseInt(e.target.value),
                            )}
                            className="md3-field !w-20"
                        />
                    </div>
                </div>
            ))}
        </div>
    );

    const notificationsList = (
        <div className={`flex flex-col gap-2 ${collapsible ? 'pt-3' : ''}`}>
            {configs.map(cfg => (
                <label key={cfg.key} className="flex items-center gap-3 cursor-pointer p-2 rounded-md3-xs hover:bg-surface-variant/40 transition-colors">
                    <input
                        type="checkbox"
                        checked={notifyFlags[cfg.key] ?? true}
                        onChange={(e) => handleNotifyChange(cfg.key, e.target.checked)}
                        className="w-5 h-5 rounded-md3-xs accent-primary"
                    />
                    <span className="text-body-md text-surface-on">{cfg.name}</span>
                </label>
            ))}
            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-md3-xs hover:bg-surface-variant/40 transition-colors">
                <input
                    type="checkbox"
                    checked={notifyFlags['tire_change'] ?? true}
                    onChange={(e) => handleNotifyChange('tire_change', e.target.checked)}
                    className="w-5 h-5 rounded-md3-xs accent-primary"
                />
                <span className="text-body-md text-surface-on">Шины</span>
            </label>
        </div>
    );

    return (
        <>
            <div>
                <label className="block text-label-lg text-surface-on mb-2">Марка</label>
                <select
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value, model: '' }))}
                    required
                    className="md3-select"
                >
                    <option value="">Выберите марку</option>
                    {brands.map(brand => (
                        <option key={brand.value} value={brand.value}>{brand.label}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-label-lg text-surface-on mb-2">Модель</label>
                <select
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    required
                    disabled={!formData.brand}
                    className="md3-select disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <option value="">{formData.brand ? 'Выберите модель' : 'Сначала выберите марку'}</option>
                    {models.map(model => (
                        <option key={model.value} value={model.value}>{model.label}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-label-lg text-surface-on mb-2">Госномер</label>
                <input
                    type="text"
                    value={formData.plate_number}
                    onChange={handlePlateChange}
                    required
                    placeholder="А123АА178 или 1234АВ7"
                    className={`md3-field ${plateError ? 'md3-field-error' : ''}`}
                />
                {plateError && <p className="mt-1 text-body-sm text-error">{plateError}</p>}
            </div>

            {yearKmInline ? (
                <div className="grid grid-cols-2 gap-4">
                    {yearInput}
                    {kmInput}
                </div>
            ) : (
                <>
                    {yearInput}
                    {kmInput}
                </>
            )}

            {collapsible ? (
                <>
                    <Spoiler title="Интервалы замен (км / мес)">{intervalsSection}</Spoiler>
                    <Spoiler title="Уведомления">{notificationsList}</Spoiler>
                </>
            ) : (
                <>
                    <hr className="md3-divider" />
                    <h4 className="text-title-sm text-surface-on m-0">Интервалы замен (км / мес)</h4>
                    <p className="text-body-sm text-outline mb-2">Первое поле — пробег (км), второе — срок в месяцах. Дата следующей замены считается от даты замены.</p>
                    {intervalsSection}
                    <hr className="md3-divider" />
                    <h4 className="text-title-sm text-surface-on m-0">Уведомления</h4>
                    {notificationsList}
                </>
            )}
        </>
    );
}
