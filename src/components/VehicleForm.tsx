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
      // handled in parent
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Добавить автомобиль">
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
            onChange={(e) => { setFormData({ ...formData, year: parseInt(e.target.value) }); setYearError(''); }}
            required
            className={`md3-field ${yearError ? 'md3-field-error' : ''}`}
          />
          {yearError && <p className="mt-1 text-body-sm text-error">{yearError}</p>}
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
          <button type="submit" className="md3-btn-primary">Добавить</button>
        </div>
      </form>
    </Modal>
  );
}
