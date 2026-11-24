import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { VehicleForm } from '../VehicleForm';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { VehicleFormData } from '../../types';

export function ProfileVehicleSection() {
    const { refreshUser } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);

    const handleAdd = async (data: VehicleFormData) => {
        try {
            await api.createVehicle(data);
            await refreshUser();
            await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
            toast.success('Автомобиль добавлен');
            setIsOpen(false);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Не удалось добавить автомобиль');
            throw err;
        }
    };

    return (
        <>
            <div className="md3-card p-6">
                <h2 className="text-title-md text-surface-on mb-4">Автомобили</h2>
                <div className="flex flex-col gap-3">
                    <p className="text-body-sm text-outline m-0">
                        Добавьте ещё один автомобиль, чтобы вести историю обслуживания
                        и расходов отдельно по каждой машине.
                    </p>
                    <button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        className="md3-btn-primary self-start"
                    >
                        Добавить автомобиль
                    </button>
                </div>
            </div>

            <VehicleForm
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSubmit={handleAdd}
            />
        </>
    );
}
