import { useState } from 'react';
import type { Vehicle } from '../types';

interface Props {
    vehicles: Vehicle[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    onEditVehicle: (vehicle: Vehicle) => void;
    onDeleteVehicle: (id: number) => void;
    onHardDeleteVehicle: (id: number) => void;
    onRestoreVehicle: (id: number) => void;
    onUpdateKm: (vehicleId: number, newKm: number) => Promise<void>;
    showArchived: boolean;
    statusIcons: Record<string, string>;
    getVehicleStatus: (vehicle: Vehicle) => string;
}

export function VehicleList({
    vehicles,
    selectedId,
    onSelect,
    onEditVehicle,
    onDeleteVehicle,
    onHardDeleteVehicle,
    onRestoreVehicle,
    onUpdateKm,
    showArchived,
    statusIcons,
    getVehicleStatus
}: Props) {
    const [editingKm, setEditingKm] = useState<number | null>(null);
    const [newKmValue, setNewKmValue] = useState<string>('');

    const handleUpdateKm = async (vehicleId: number, currentKm: number) => {
        const newKm = parseInt(newKmValue);
        if (isNaN(newKm) || newKm <= currentKm) {
            alert('Пробег должен быть больше текущего');
            return;
        }

        try {
            await onUpdateKm(vehicleId, newKm);
            setEditingKm(null);
            setNewKmValue('');
        } catch {
            // error handled in HomePage
        }
    };

    if (vehicles.length === 0) {
        return (
            <div className="text-center py-12 px-4">
                <p className="text-body-large text-md-on-surface-variant">
                    Нет автомобилей. Добавьте первый!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {vehicles.map(vehicle => {
                const status = getVehicleStatus(vehicle);
                const icon = statusIcons[status] || '⚪';
                const isSelected = selectedId === vehicle.id;

                return (
                    <div
                        key={vehicle.id}
                        className={`rounded-md-md border transition-all duration-md-2 cursor-pointer
                                    ${isSelected
                                ? 'bg-md-secondary-container border-md-secondary shadow-md-1'
                                : 'bg-md-surface border-md-outline-variant hover:shadow-md-1 hover:border-md-outline'
                            }`}
                    >
                        <div className="p-3 flex items-center gap-3 flex-wrap">
                            <div
                                className="flex items-center gap-3 flex-1 min-w-0"
                                onClick={() => onSelect(vehicle.id)}
                            >
                                <span className="text-xl flex-shrink-0">{icon}</span>
                                <div className="min-w-0">
                                    <p className="text-body-medium text-md-on-surface truncate">
                                        {vehicle.brand} {vehicle.model}
                                    </p>
                                    <p className="text-body-small text-md-on-surface-variant">
                                        {vehicle.current_km} км ({vehicle.plate_number})
                                        {status === 'unknown' && <span className="text-md-error ml-1">*</span>}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-1.5 flex-wrap">
                                {!showArchived ? (
                                    <>
                                        <button
                                            onClick={() => onEditVehicle(vehicle)}
                                            className="inline-flex items-center justify-center w-9 h-9 rounded-md-full
                                                       text-body-medium bg-md-tertiary-container text-md-on-tertiary-container
                                                       transition-all duration-md-2 hover:shadow-md-1 active:scale-90"
                                            title="Редактировать"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => onDeleteVehicle(vehicle.id)}
                                            className="inline-flex items-center justify-center w-9 h-9 rounded-md-full
                                                       text-body-medium bg-yellow-100 text-yellow-800
                                                       transition-all duration-md-2 hover:shadow-md-1 active:scale-90"
                                            title="Удалить (в архив)"
                                        >
                                            🗑️
                                        </button>
                                        {editingKm === vehicle.id ? (
                                            <div className="flex gap-1.5 items-center">
                                                <input
                                                    type="number"
                                                    value={newKmValue}
                                                    onChange={(e) => setNewKmValue(e.target.value)}
                                                    placeholder="Новый пробег"
                                                    className="w-28 px-2 py-1.5 text-body-small rounded-md-sm
                                                               border border-md-outline bg-md-surface
                                                               text-md-on-surface
                                                               focus:outline-none focus:ring-2 focus:ring-md-primary"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => handleUpdateKm(vehicle.id, vehicle.current_km)}
                                                    className="inline-flex items-center justify-center w-9 h-9 rounded-md-full
                                                               bg-md-status-good-text text-white text-body-medium
                                                               transition-all duration-md-2 hover:shadow-md-1 active:scale-90"
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={() => { setEditingKm(null); setNewKmValue(''); }}
                                                    className="inline-flex items-center justify-center w-9 h-9 rounded-md-full
                                                               bg-md-outline text-white text-body-medium
                                                               transition-all duration-md-2 hover:shadow-md-1 active:scale-90"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setEditingKm(vehicle.id)}
                                                className="inline-flex items-center justify-center w-9 h-9 rounded-md-full
                                                           text-body-medium bg-md-primary-container text-md-on-primary-container
                                                           transition-all duration-md-2 hover:shadow-md-1 active:scale-90"
                                                title="Обновить пробег"
                                            >
                                                📍
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => onRestoreVehicle(vehicle.id)}
                                            className="inline-flex items-center justify-center w-9 h-9 rounded-md-full
                                                       text-body-medium bg-md-status-good-text text-white
                                                       transition-all duration-md-2 hover:shadow-md-1 active:scale-90"
                                            title="Восстановить из архива"
                                        >
                                            ↩️
                                        </button>
                                        <button
                                            onClick={() => onHardDeleteVehicle(vehicle.id)}
                                            className="inline-flex items-center justify-center w-9 h-9 rounded-md-full
                                                       text-body-medium bg-md-error text-md-on-error
                                                       transition-all duration-md-2 hover:shadow-md-1 active:scale-90"
                                            title="Полностью удалить"
                                        >
                                            💀
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
