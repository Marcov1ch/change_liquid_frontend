import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { api } from '../api/client';
import type { VehicleFormData } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (vehicle: VehicleFormData) => Promise<void>;
}

const intervalFields = [
    { key: 'oil_interval_km', label: 'Моторное масло' },
    { key: 'transmission_interval_km', label: 'Масло АКПП' },
    { key: 'brake_interval_km', label: 'Тормозная жидкость' },
    { key: 'coolant_interval_km', label: 'Антифриз' },
    { key: 'power_steering_interval_km', label: 'Жидкость ГУР' },
    { key: 'differential_oil_interval_km', label: 'Масло в редукторе' },
] as const;

const notifyFields = [
    { key: 'oil_notify_enabled', label: 'Моторное масло' },
    { key: 'transmission_notify_enabled', label: 'Масло АКПП' },
    { key: 'brake_notify_enabled', label: 'Тормозная жидкость' },
    { key: 'coolant_notify_enabled', label: 'Антифриз' },
    { key: 'power_steering_notify_enabled', label: 'Жидкость ГУР' },
    { key: 'differential_oil_notify_enabled', label: 'Масло в редукторе' },
] as const;

const defaultFormData = {
    brand: '',
    model: '',
    plate_number: '',
    year: new Date().getFullYear(),
    current_km: 0,
    oil_interval_km: 7000,
    transmission_interval_km: 60000,
    brake_interval_km: 40000,
    coolant_interval_km: 60000,
    power_steering_interval_km: 40000,
    differential_oil_interval_km: 50000,
    oil_notify_enabled: true,
    transmission_notify_enabled: true,
    brake_notify_enabled: true,
    coolant_notify_enabled: true,
    power_steering_notify_enabled: true,
    differential_oil_notify_enabled: true
};

export function VehicleForm({ isOpen, onClose, onSubmit }: Props) {
    const [brands, setBrands] = useState<{ value: string; label: string }[]>([]);
    const [models, setModels] = useState<{ value: string; label: string }[]>([]);
    const [plateError, setPlateError] = useState('');
    const [yearError, setYearError] = useState('');
    const [formData, setFormData] = useState(defaultFormData);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.getBrands().then(data => setBrands(data.brands));
    }, []);

    useEffect(() => {
        if (formData.brand) {
            api.getModels(formData.brand).then(data => setModels(data.models));
        } else {
            setModels([]);
        }
    }, [formData.brand]);

    const validatePlateNumber = (value: string) => {
        const allowedLetters = 'АВЕІКМНОРСТУХ';
        const rfPattern = new RegExp(`^[${allowedLetters}]\\d{3}[${allowedLetters}]{2}\\d{2,3}$`);
        const byCurrentPattern = new RegExp(`^\\d{4}[${allowedLetters}]{2}\\d$`);
        const byOldPattern = new RegExp(`^\\d{4}[${allowedLetters}]{2}$`);
        const cleaned = value.replace(/\s/g, '').replace(/-/g, '').toUpperCase();

        if (!rfPattern.test(cleaned) && !byCurrentPattern.test(cleaned) && !byOldPattern.test(cleaned) && cleaned !== '') {
            setPlateError('Некорректный формат госномера. Допустимые форматы: А123АА178 (РФ) или 1234AB7 (РБ)');
            return false;
        }
        setPlateError('');
        return true;
    };

    const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\s/g, '').replace(/-/g, '').toUpperCase();
        setFormData({ ...formData, plate_number: value });
        validatePlateNumber(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePlateNumber(formData.plate_number)) {
            alert('Пожалуйста, исправьте ошибки в форме');
            return;
        }

        const currentYear = new Date().getFullYear();
        if (formData.year > currentYear || formData.year < 1960) {
            setYearError(`Год выпуска должен быть от 1960 до ${currentYear}`);
            return;
        }
        setYearError('');

        setSubmitting(true);
        try {
            await onSubmit(formData);
            setFormData(defaultFormData);
            setPlateError('');
        } catch {
            // error handled in HomePage
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass = "w-full px-3 py-2 text-body-large rounded-md-sm border border-md-outline bg-md-surface text-md-on-surface transition-all duration-md-2 focus:outline-none focus:ring-2 focus:ring-md-primary focus:border-md-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
    const selectClass = "w-full px-3 py-2 text-body-large rounded-md-sm border border-md-outline bg-md-surface text-md-on-surface transition-all duration-md-2 focus:outline-none focus:ring-2 focus:ring-md-primary focus:border-md-primary disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Добавить автомобиль">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-label-large mb-1 text-md-on-surface">Марка</label>
                    <select
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value, model: '' })}
                        required
                        className={selectClass}
                    >
                        <option value="">Выберите марку</option>
                        {brands.map(brand => (
                            <option key={brand.value} value={brand.value}>{brand.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-label-large mb-1 text-md-on-surface">Модель</label>
                    <select
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        required
                        disabled={!formData.brand}
                        className={selectClass}
                    >
                        <option value="">{formData.brand ? "Выберите модель" : "Сначала выберите марку"}</option>
                        {models.map(model => (
                            <option key={model.value} value={model.value}>{model.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-label-large mb-1 text-md-on-surface">Госномер</label>
                    <input
                        type="text"
                        value={formData.plate_number}
                        onChange={handlePlateChange}
                        required
                        placeholder="А123АА178 или 1234AB7"
                        className={inputClass}
                    />
                    {plateError && <p className="text-md-error text-body-small mt-1">{plateError}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-label-large mb-1 text-md-on-surface">Год выпуска</label>
                        <input
                            type="number"
                            value={formData.year}
                            onChange={(e) => { setFormData({ ...formData, year: parseInt(e.target.value) }); setYearError(''); }}
                            required
                            className={inputClass}
                        />
                        {yearError && <p className="text-md-error text-body-small mt-1">{yearError}</p>}
                    </div>
                    <div>
                        <label className="block text-label-large mb-1 text-md-on-surface">Пробег (км)</label>
                        <input
                            type="number"
                            value={formData.current_km}
                            onChange={(e) => setFormData({ ...formData, current_km: parseInt(e.target.value) })}
                            required
                            className={inputClass}
                        />
                    </div>
                </div>

                <div className="md-divider" />

                <h4 className="text-title-small text-md-on-surface mb-3">Интервалы замен (км)</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {intervalFields.map(({ key, label }) => (
                        <div key={key}>
                            <label className="block text-label-medium mb-1 text-md-on-surface-variant">{label}</label>
                            <input
                                type="number"
                                value={(formData as unknown as Record<string, number>)[key]}
                                onChange={(e) => setFormData({ ...formData, [key]: parseInt(e.target.value) })}
                                className={inputClass}
                            />
                        </div>
                    ))}
                </div>

                <div className="md-divider" />

                <h4 className="text-title-small text-md-on-surface mb-3">Уведомления</h4>

                <div className="space-y-2">
                    {notifyFields.map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-3 cursor-pointer py-1">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    checked={(formData as unknown as Record<string, boolean>)[key]}
                                    onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                                    className="peer sr-only"
                                />
                                <div className="w-5 h-5 rounded-md-sm border-2 border-md-outline
                                                transition-all duration-md-2
                                                peer-checked:bg-md-primary peer-checked:border-md-primary
                                                peer-checked:after:content-['✓'] peer-checked:after:text-white
                                                peer-checked:after:flex peer-checked:after:items-center
                                                peer-checked:after:justify-center
                                                peer-checked:after:w-full peer-checked:after:h-full
                                                peer-checked:after:text-xs" />
                            </div>
                            <span className="text-body-medium text-md-on-surface">{label}</span>
                        </label>
                    ))}
                </div>

                <div className="flex gap-3 justify-end pt-3 border-t border-md-outline-variant">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 rounded-md-full text-label-large
                                   bg-md-surface-variant text-md-on-surface-variant
                                   transition-all duration-md-2 hover:shadow-md-1 active:scale-[0.98]"
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2 rounded-md-full text-label-large
                                   bg-md-primary text-md-on-primary
                                   transition-all duration-md-2 hover:shadow-md-1
                                   active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                                   flex items-center gap-2"
                    >
                        {submitting && (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white
                                             rounded-md-full animate-spin" />
                        )}
                        Добавить
                    </button>
                </div>
            </form>
        </Modal>
    );
}
