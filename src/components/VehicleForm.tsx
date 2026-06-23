import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { api } from '../api/client';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (vehicle: any) => Promise<void>;
}

export function VehicleForm({ isOpen, onClose, onSubmit }: Props) {
    const [brands, setBrands] = useState<{ value: string; label: string }[]>([]);
    const [models, setModels] = useState<{ value: string; label: string }[]>([]);
    const [plateError, setPlateError] = useState('');
    const [yearError, setYearError] = useState('');
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
        differential_oil_interval_km: 50000
    });

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
        const allowedLetters = 'АВЕКМНОРСТУХ';
        const pattern = new RegExp(`^[${allowedLetters}]\\d{3}[${allowedLetters}]{2}\\d{2,3}$`);
        const cleaned = value.replace(/\s/g, '').toUpperCase();

        if (!pattern.test(cleaned) && cleaned !== '') {
            setPlateError('Некорректный формат госномера. Разрешённые буквы: А, В, Е, К, М, Н, О, Р, С, Т, У, Х. Пример: А123АА198');
            return false;
        }
        setPlateError('');
        return true;
    };

    const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
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

        try {
            await onSubmit(formData);
            setFormData({
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
                differential_oil_interval_km: 50000
            });
            setPlateError('');
        } catch {
            // ошибка уже показана в HomePage
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Добавить автомобиль">
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Марка</label>
                    <select
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value, model: '' })}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                    >
                        <option value="">Выберите марку</option>
                        {brands.map(brand => (
                            <option key={brand.value} value={brand.value}>{brand.label}</option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Модель</label>
                    <select
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        required
                        disabled={!formData.brand}
                        style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                    >
                        <option value="">{formData.brand ? "Выберите модель" : "Сначала выберите марку"}</option>
                        {models.map(model => (
                            <option key={model.value} value={model.value}>{model.label}</option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Госномер</label>
                    <input
                        type="text"
                        value={formData.plate_number}
                        onChange={handlePlateChange}
                        required
                        placeholder="А123АА198"
                        style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                    />
                    {plateError && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{plateError}</div>}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Год выпуска</label>
                    <input
                        type="number"
                        value={formData.year}
                        onChange={(e) => { setFormData({ ...formData, year: parseInt(e.target.value) }); setYearError(''); }}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                    />
                    {yearError && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{yearError}</div>}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Пробег (км)</label>
                    <input
                        type="number"
                        value={formData.current_km}
                        onChange={(e) => setFormData({ ...formData, current_km: parseInt(e.target.value) })}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                    />
                </div>

                <hr />
                <h4>Интервалы замен (км)</h4>

                <div style={{ marginBottom: '15px' }}>
                    <label>Моторное масло</label>
                    <input
                        type="number"
                        value={formData.oil_interval_km}
                        onChange={(e) => setFormData({ ...formData, oil_interval_km: parseInt(e.target.value) })}
                        style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Масло АКПП</label>
                    <input
                        type="number"
                        value={formData.transmission_interval_km}
                        onChange={(e) => setFormData({ ...formData, transmission_interval_km: parseInt(e.target.value) })}
                        style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Тормозная жидкость</label>
                    <input
                        type="number"
                        value={formData.brake_interval_km}
                        onChange={(e) => setFormData({ ...formData, brake_interval_km: parseInt(e.target.value) })}
                        style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Антифриз</label>
                    <input
                        type="number"
                        value={formData.coolant_interval_km}
                        onChange={(e) => setFormData({ ...formData, coolant_interval_km: parseInt(e.target.value) })}
                        style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Жидкость ГУР</label>
                    <input
                        type="number"
                        value={formData.power_steering_interval_km}
                        onChange={(e) => setFormData({ ...formData, power_steering_interval_km: parseInt(e.target.value) })}
                        style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Масло в редукторе</label>
                    <input
                        type="number"
                        value={formData.differential_oil_interval_km}
                        onChange={(e) => setFormData({ ...formData, differential_oil_interval_km: parseInt(e.target.value) })}
                        style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button type="button" onClick={onClose}>Отмена</button>
                    <button type="submit" style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '5px' }}>
                        Добавить
                    </button>
                </div>
            </form>
        </Modal>
    );
}