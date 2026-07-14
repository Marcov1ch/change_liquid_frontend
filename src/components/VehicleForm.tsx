import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { api } from '../api/client';
import type { VehicleFormData, ComponentConfig } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (vehicle: VehicleFormData) => Promise<void>;
}

export function VehicleForm({ isOpen, onClose, onSubmit }: Props) {
    const [brands, setBrands] = useState<{ value: string; label: string }[]>([]);
    const [models, setModels] = useState<{ value: string; label: string }[]>([]);
    const [configs, setConfigs] = useState<ComponentConfig[]>([]);
    const [plateError, setPlateError] = useState('');
    const [yearError, setYearError] = useState('');
    const [intervals, setIntervals] = useState<Record<string, number>>({});
    const [notifyFlags, setNotifyFlags] = useState<Record<string, boolean>>({});
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        plate_number: '',
        year: new Date().getFullYear(),
        current_km: 0,
    });

    useEffect(() => {
        api.getBrands().then(data => setBrands(data.brands));
        api.getComponentConfigs().then(data => {
            const cfgMap: Record<string, number> = {};
            const notifyMap: Record<string, boolean> = {};
            data.configs.forEach(c => {
                cfgMap[c.key] = c.default_interval;
                notifyMap[c.key] = true;
            });
            setConfigs(data.configs);
            setIntervals(cfgMap);
            setNotifyFlags(notifyMap);
        });
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

    const handleIntervalChange = (key: string, value: number) => {
        setIntervals(prev => ({ ...prev, [key]: value }));
    };

    const handleNotifyChange = (key: string, checked: boolean) => {
        setNotifyFlags(prev => ({ ...prev, [key]: checked }));
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
            await onSubmit({
                ...formData,
                intervals,
                notify_flags: notifyFlags,
            });
            setFormData({
                brand: '',
                model: '',
                plate_number: '',
                year: new Date().getFullYear(),
                current_km: 0,
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
                        placeholder="А123АА178 или 1234AB7"
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

                {configs.map(cfg => (
                    <div key={cfg.key} style={{ marginBottom: '15px' }}>
                        <label>{cfg.name}</label>
                        <input
                            type="number"
                            value={intervals[cfg.key] ?? cfg.default_interval}
                            onChange={(e) => handleIntervalChange(cfg.key, parseInt(e.target.value))}
                            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                        />
                    </div>
                ))}

                <hr />
                <h4>Уведомления</h4>

                <div style={{ marginBottom: '10px' }}>
                    {configs.map(cfg => (
                        <label key={cfg.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={notifyFlags[cfg.key] ?? true}
                                onChange={(e) => handleNotifyChange(cfg.key, e.target.checked)}
                            />
                            {cfg.name}
                        </label>
                    ))}
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
