import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { api } from '../api/client';
import type { Vehicle, ComponentConfig } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onUpdate: () => void;
}

export function EditVehicleForm({ isOpen, onClose, vehicle, onUpdate }: Props) {
  const [brands, setBrands] = useState<{ value: string; label: string }[]>([]);
  const [models, setModels] = useState<{ value: string; label: string }[]>([]);
  const [configs, setConfigs] = useState<ComponentConfig[]>([]);
  const [plateError, setPlateError] = useState('');
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    plate_number: '',
    year: new Date().getFullYear(),
    current_km: 0,
  });
  const [intervals, setIntervals] = useState<Record<string, number>>({});
  const [notifyFlags, setNotifyFlags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    api.getBrands().then(data => setBrands(data.brands));
    api.getComponentConfigs().then(data => setConfigs(data.configs));
  }, []);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        plate_number: vehicle.plate_number || '',
        year: vehicle.year || new Date().getFullYear(),
        current_km: vehicle.current_km || 0,
      });
      setIntervals(vehicle.intervals || {});
      setNotifyFlags(vehicle.notify_flags || {});
    }
  }, [vehicle]);

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

    if (!vehicle) return;

    try {
      await api.updateVehicle(vehicle.id, {
        ...formData,
        intervals,
        notify_flags: notifyFlags,
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Ошибка при обновлении:', error);
      alert('Не удалось обновить автомобиль');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Редактировать автомобиль">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-label-lg text-surface-on mb-2">Марка</label>
          <select
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value, model: '' })}
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
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
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
            placeholder="А123АА178 или 1234AB7"
            className={`md3-field ${plateError ? 'md3-field-error' : ''}`}
          />
          {plateError && <p className="mt-1 text-body-sm text-error">{plateError}</p>}
        </div>

        <div>
          <label className="block text-label-lg text-surface-on mb-2">Год выпуска</label>
          <input
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            required
            className="md3-field"
          />
        </div>

        <div>
          <label className="block text-label-lg text-surface-on mb-2">Пробег (км)</label>
          <input
            type="number"
            value={formData.current_km}
            onChange={(e) => setFormData({ ...formData, current_km: parseInt(e.target.value) })}
            required
            className="md3-field"
          />
        </div>

        <hr className="md3-divider" />

        <h4 className="text-title-sm text-surface-on m-0">Интервалы замен (км)</h4>

        <div className="flex flex-col gap-4">
          {configs.map(cfg => (
            <div key={cfg.key}>
              <label className="block text-label-md text-surface-on-variant mb-1">{cfg.name}</label>
              <input
                type="number"
                value={intervals[cfg.key] ?? cfg.default_interval}
                onChange={(e) => handleIntervalChange(cfg.key, parseInt(e.target.value))}
                className="md3-field"
              />
            </div>
          ))}
        </div>

        <hr className="md3-divider" />

        <h4 className="text-title-sm text-surface-on m-0">Уведомления</h4>

        <div className="flex flex-col gap-2">
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
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="md3-btn-text">Отмена</button>
          <button type="submit" className="md3-btn-primary">Сохранить</button>
        </div>
      </form>
    </Modal>
  );
}
