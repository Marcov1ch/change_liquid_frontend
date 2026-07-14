import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { api } from '../api/client';
import type { Vehicle } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    vehicle: Vehicle | null;
    onUpdate: () => void;
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

export function EditVehicleForm({ isOpen, onClose, vehicle, onUpdate }: Props) {
    const [brands, setBrands] = useState<{ value: string; label: string }[]>([]);
    const [models, setModels] = useState<{ value: string; label: string }[]>([]);
    const [plateError, setPlateError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
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
    });

    useEffect(() => {
        if (vehicle) {
            setFormData({
                brand: vehicle.brand || '',
                model: vehicle.model || '',
                plate_number: vehicle.plate_number || '',
                year: vehicle.year || new Date().getFullYear(),
                current_km: vehicle.current_km || 0,
                oil_interval_km: vehicle.oil_interval_km || 7000,
                transmission_interval_km: vehicle.transmission_interval_km || 60000,
                brake_interval_km: vehicle.brake_interval_km || 40000,
                coolant_interval_km: vehicle.coolant_interval_km || 60000,
                power_steering_interval_km: vehicle.power_steering_interval_km || 40000,
                differential_oil_interval_km: vehicle.differential_oil_interval_km || 50000,
                oil_notify_enabled: vehicle.oil_notify_enabled,
                transmission_notify_enabled: vehicle.transmission_notify_enabled,
                brake_notify_enabled: vehicle.brake_notify_enabled,
                coolant_notify_enabled: vehicle.coolant_notify_enabled,
                power_steering_notify_enabled: vehicle.power_steering_notify_enabled,
                differential_oil_notify_enabled: vehicle.differential_oil_notify_enabled
            });
        }
    }, [vehicle]);

    useEffect(() => {
        api.getBrands().then(data => setBrands(data.brands));
    }, []);

    useEffect(() => {
        if (formData.brand) {
            api.getModels(formData.brand).then(data => setModels(data.models));
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

        if (!vehicle) return;

        setSubmitting(true);
        try {
            await api.updateVehicle(vehicle.id, formData);
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Ошибка при обновлении:', error);
            alert('Не удалось обновить автомобиль');
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass = "w-full px-3 py-2 text-body-large rounded-md-sm border border-md-outline bg-md-surface text-md-on-surface transition-all duration-md-2 focus:outline-none focus:ring-2 focus:ring-md-primary focus:border-md-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
    const selectClass = "w-full px-3 py-2 text-body-large rounded-md-sm border border-md-outline bg-md-surface text-md-on-surface transition-all duration-md-2 focus:outline-none focus:ring-2 focus:ring-md-primary focus:border-md-primary disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Редактировать автомобиль">
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
                            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                            required
                            className={inputClass}
                        />
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
                        Сохранить
                    </button>
                </div>
            </form>
        </Modal>
    );
}
