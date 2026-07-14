import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { VehicleList } from '../components/VehicleList';
import { ReplacementList } from '../components/ReplacementList';
import { VehicleForm } from '../components/VehicleForm';
import { EditVehicleForm } from '../components/EditVehicleForm';
import type { Vehicle, VehicleFormData } from '../types';

export function HomePage() {
    const queryClient = useQueryClient();
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showArchived, setShowArchived] = useState(false);

    const { data: vehicles = [] } = useQuery({
        queryKey: ['vehicles'],
        queryFn: api.getAllVehicles,
    });

    const { data: replacements = [] } = useQuery({
        queryKey: ['replacements', selectedId],
        queryFn: () => api.getReplacements(selectedId!),
        enabled: !!selectedId,
    });

    const selectedVehicle = vehicles.find(v => v.id === selectedId);

    const activeVehicles = vehicles.filter(v => v.is_active !== false);
    const archivedVehicles = vehicles.filter(v => v.is_active === false);

    const invalidateVehicles = () => queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    const invalidateReplacements = () => {
        if (selectedId) queryClient.invalidateQueries({ queryKey: ['replacements', selectedId] });
    };

    const createVehicleMutation = useMutation({
        mutationFn: api.createVehicle,
        onSuccess: () => {
            invalidateVehicles();
            setShowForm(false);
        },
    });

    const updateKmMutation = useMutation({
        mutationFn: ({ vehicleId, newKm }: { vehicleId: number; newKm: number }) =>
            api.updateVehicleKm(vehicleId, newKm),
        onSuccess: () => {
            invalidateVehicles();
            invalidateReplacements();
        },
    });

    const handleAddVehicle = async (newVehicle: VehicleFormData) => {
        try {
            await createVehicleMutation.mutateAsync(newVehicle);
        } catch (error) {
            if (error instanceof Error) alert(error.message);
        }
    };

    const handleReplacementsUpdate = () => {
        invalidateReplacements();
        invalidateVehicles();
    };

    const handleVehicleUpdate = () => {
        invalidateVehicles();
        invalidateReplacements();
    };

    const handleEditVehicle = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setShowEditForm(true);
    };

    const handleDeleteVehicle = async (id: number) => {
        if (!confirm('Удалить автомобиль? (можно будет восстановить)')) return;
        try {
            await api.deleteVehicle(id);
            invalidateVehicles();
            if (selectedId === id) setSelectedId(null);
        } catch (error) {
            console.error('Ошибка при удалении:', error);
            alert('Не удалось удалить автомобиль');
        }
    };

    const handleHardDeleteVehicle = async (id: number) => {
        if (!confirm('ПОЛНОСТЬЮ удалить автомобиль из базы данных? Это действие необратимо!')) return;
        try {
            await api.hardDeleteVehicle(id);
            invalidateVehicles();
            if (selectedId === id) setSelectedId(null);
        } catch (error) {
            console.error('Ошибка при жестком удалении:', error);
            alert('Не удалось удалить автомобиль');
        }
    };

    const handleRestoreVehicle = async (id: number) => {
        try {
            await api.restoreVehicle(id);
            invalidateVehicles();
        } catch (error) {
            console.error('Ошибка при восстановлении:', error);
            alert('Не удалось восстановить автомобиль');
        }
    };

    const handleUpdateKm = async (vehicleId: number, newKm: number) => {
        try {
            await updateKmMutation.mutateAsync({ vehicleId, newKm });
        } catch (error) {
            console.error('Ошибка при обновлении пробега:', error);
            alert('Не удалось обновить пробег');
        }
    };

    const getVehicleStatus = (vehicle: Vehicle) => {
        return vehicle.vehicle_status || 'unknown';
    };

    const statusIcons = {
        overdue: '🔴',
        critical: '🟠',
        warning: '🟡',
        good: '🟢',
        unknown: '⚪'
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-headline-small m-0">Мои автомобили</h1>
            </div>

            <button
                onClick={() => setShowForm(true)}
                className="w-full py-3 px-4 rounded-md-full text-label-large
                           bg-md-primary text-md-on-primary
                           transition-all duration-md-2 hover:shadow-md-2
                           active:scale-[0.98]"
            >
                + Добавить автомобиль
            </button>

            <div className="flex gap-2 p-1 bg-md-surface-variant rounded-md-full w-fit">
                <button
                    onClick={() => setShowArchived(false)}
                    className={`px-4 py-1.5 rounded-md-full text-label-large transition-all duration-md-2
                                ${!showArchived
                                ? 'bg-md-primary-container text-md-on-primary-container shadow-md-1'
                                : 'text-md-on-surface-variant hover:text-md-on-surface'
                            }`}
                >
                    Активные ({activeVehicles.length})
                </button>
                <button
                    onClick={() => setShowArchived(true)}
                    className={`px-4 py-1.5 rounded-md-full text-label-large transition-all duration-md-2
                                ${showArchived
                                ? 'bg-md-primary-container text-md-on-primary-container shadow-md-1'
                                : 'text-md-on-surface-variant hover:text-md-on-surface'
                            }`}
                >
                    Архив ({archivedVehicles.length})
                </button>
            </div>

            <VehicleList
                vehicles={showArchived ? archivedVehicles : activeVehicles}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onEditVehicle={handleEditVehicle}
                onDeleteVehicle={handleDeleteVehicle}
                onHardDeleteVehicle={handleHardDeleteVehicle}
                onRestoreVehicle={handleRestoreVehicle}
                onUpdateKm={handleUpdateKm}
                showArchived={showArchived}
                statusIcons={statusIcons}
                getVehicleStatus={getVehicleStatus}
            />

            {selectedVehicle && (
                <ReplacementList
                    replacements={replacements}
                    vehicleId={selectedId}
                    selectedVehicle={selectedVehicle}
                    onClose={() => setSelectedId(null)}
                    onReplacementsUpdate={handleReplacementsUpdate}
                />
            )}

            <VehicleForm
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                onSubmit={handleAddVehicle}
            />

            <EditVehicleForm
                isOpen={showEditForm}
                onClose={() => setShowEditForm(false)}
                vehicle={editingVehicle}
                onUpdate={handleVehicleUpdate}
            />
        </div>
    );
}
