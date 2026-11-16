import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { MAX_PLATE_LENGTH, validatePlateNumber } from '../utils/plateValidation';
import { useBrands, useModels } from './useEnums';
import type { Vehicle } from '../types';

const YEAR_MIN = 1960;

interface UseVehicleFormOptions {
    vehicle?: Vehicle | null;
}

export function useVehicleForm({ vehicle = null }: UseVehicleFormOptions = {}) {
    const [plateError, setPlateError] = useState('');
    const [yearError, setYearError] = useState('');
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        plate_number: '',
        year: 0,
        current_km: 0,
    });

    const { data: brandsData } = useBrands();
    const { data: modelsData } = useModels(formData.brand);

    const brands = brandsData?.brands ?? [];
    const models = modelsData?.models ?? [];

    useEffect(() => {
        if (vehicle) {
            setFormData({
                brand: vehicle.brand || '',
                model: vehicle.model || '',
                plate_number: vehicle.plate_number || '',
                year: vehicle.year || new Date().getFullYear(),
                current_km: vehicle.current_km || 0,
            });
        }
    }, [vehicle]);

    const handlePlateChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase().slice(0, MAX_PLATE_LENGTH);
        setFormData(prev => ({ ...prev, plate_number: value }));
        setPlateError(validatePlateNumber(value) || '');
    };

    const validateForm = useCallback((): boolean => {
        const plateErr = validatePlateNumber(formData.plate_number);
        setPlateError(plateErr || '');
        if (plateErr) return false;

        const currentYear = new Date().getFullYear();
        const maxYear = currentYear + 1;
        if (!Number.isFinite(formData.year) || formData.year > maxYear || formData.year < YEAR_MIN) {
            setYearError(`Год выпуска должен быть от ${YEAR_MIN} до ${maxYear}`);
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
        plateError,
        yearError,
        brands,
        models,
        handlePlateChange,
        validateForm,
        resetForm,
    };
}
