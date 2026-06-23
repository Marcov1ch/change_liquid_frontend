import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { api } from '../api/client';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    vehicle: any;
    onUpdate: () => void;
}

export function EditVehicleForm({ isOpen, onClose, vehicle, onUpdate }: Props) {
    const [brands, setBrands] = useState<{ value: string; label: string }[]>([]);
    const [models, setModels] = useState<{ value: string; label: string }[]>([]);
    const [plateError, setPlateError] = useState('');
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
                differential_oil_interval_km: vehicle.differential_oil_interval_km || 50000
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
        let value = e.target.value;
        // Преобразуем все буквы в заглавные
        value = value.toUpperCase();
        console.log('После toUpperCase:', value);
        setFormData({ ...formData, plate_number: value });
        validatePlateNumber(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validatePlateNumber(formData.plate_number)) {
            alert('Пожалуйста, исправьте ошибки в форме');
            return;
        }

        try {
            await api.updateVehicle(vehicle.id, formData);
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Ошибка при обновлении:', error);
            alert('Не удалось обновить автомобиль');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Редактировать автомобиль">
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Марка</label>
                    <select
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value, model: '' })}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
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
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
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
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Пробег (км)</label>
                    <input
                        type="number"
                        value={formData.current_km}
                        onChange={(e) => setFormData({ ...formData, current_km: parseInt(e.target.value) })}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
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
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Масло АКПП</label>
                    <input
                        type="number"
                        value={formData.transmission_interval_km}
                        onChange={(e) => setFormData({ ...formData, transmission_interval_km: parseInt(e.target.value) })}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Тормозная жидкость</label>
                    <input
                        type="number"
                        value={formData.brake_interval_km}
                        onChange={(e) => setFormData({ ...formData, brake_interval_km: parseInt(e.target.value) })}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Антифриз</label>
                    <input
                        type="number"
                        value={formData.coolant_interval_km}
                        onChange={(e) => setFormData({ ...formData, coolant_interval_km: parseInt(e.target.value) })}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Жидкость ГУР</label>
                    <input
                        type="number"
                        value={formData.power_steering_interval_km}
                        onChange={(e) => setFormData({ ...formData, power_steering_interval_km: parseInt(e.target.value) })}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Масло в редукторе</label>
                    <input
                        type="number"
                        value={formData.differential_oil_interval_km}
                        onChange={(e) => setFormData({ ...formData, differential_oil_interval_km: parseInt(e.target.value) })}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button type="button" onClick={onClose}>Отмена</button>
                    <button type="submit" style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '5px' }}>
                        Сохранить
                    </button>
                </div>
            </form>
        </Modal>
    );
}