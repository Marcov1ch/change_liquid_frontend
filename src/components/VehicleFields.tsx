import type { useVehicleForm } from '../hooks/useVehicleForm';

type VehicleFormModel = ReturnType<typeof useVehicleForm>;

interface Props {
    form: VehicleFormModel;
    yearKmInline?: boolean;
}

export function VehicleFields({ form, yearKmInline = false }: Props) {
    const {
        formData, setFormData, setYearError,
        plateError, yearError,
        brands, models,
        handlePlateChange,
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
                    maxLength={15}
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
        </>
    );
}
