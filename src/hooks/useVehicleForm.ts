import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { validatePlateNumber } from '../utils/plateValidation';
import { useBrands, useComponentConfigs, useModels } from './useEnums';
import type { Vehicle } from '../types';

const YEAR_MIN = 1960;

interface UseVehicleFormOptions {
    vehicle?: Vehicle | null;
}

export function useVehicleForm({ vehicle = null }: UseVehicleFormOptions = {}) {
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

    const { data: brandsData } = useBrands();
    const { data: configsData } = useComponentConfigs();
    const { data: modelsData } = useModels(formData.brand);

    const brands = brandsData?.brands ?? [];
    const models = modelsData?.models ?? [];
    const configs = configsData?.configs ?? [];

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
        if (!configsData) return;
        const cfgMap: Record<string, number> = {};
        const notifyMap: Record<string, boolean> = {};
        configsData.configs.forEach(c => {
            cfgMap[c.key] = c.default_interval;
            notifyMap[c.key] = true;
        });
        notifyMap['tire_change'] = true;
        setIntervals(prev => ({ ...cfgMap, ...prev }));
        setNotifyFlags(prev => ({ ...notifyMap, ...prev }));
    }, [configsData]);

    const handlePlateChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\s/g, '').replace(/-/g, '').toUpperCase();
        setFormData(prev => ({ ...prev, plate_number: value }));
        setPlateError(validatePlateNumber(value) || '');
    };

    const handleIntervalChange = (key: string, value: number) => {
        setIntervals(prev => ({ ...prev, [key]: value }));
    };

    const handleNotifyChange = (key: string, checked: boolean) => {
        setNotifyFlags(prev => ({ ...prev, [key]: checked }));
    };

    const validateForm = useCallback((): boolean => {
        const plateErr = validatePlateNumber(formData.plate_number);
        setPlateError(plateErr || '');
        if (plateErr) return false;

        const currentYear = new Date().getFullYear();
        if (formData.year > currentYear || formData.year < YEAR_MIN) {
            setYearError(`Год выпуска должен быть от ${YEAR_MIN} до ${currentYear}`);
            return false;
        }
        setYearError('');
        return true;
    }, [formData.plate_number, formData.year]);

    const resetForm = useCallback(() => {
        setFormData({
            brand: '',
            model: '',
            plate_number: '',
            year: new Date().getFullYear(),
            current_km: 0,
        });
        setPlateError('');
        setYearError('');
    }, []);

    return {
        formData,
        setFormData,
        setYearError,
        intervals,
        setIntervals,
        notifyFlags,
        setNotifyFlags,
        plateError,
        yearError,
        brands,
        models,
        configs,
        handlePlateChange,
        handleIntervalChange,
        handleNotifyChange,
        validateForm,
        resetForm,
    };
}
