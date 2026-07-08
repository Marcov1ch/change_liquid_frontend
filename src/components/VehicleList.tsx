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
            // ошибка уже показана в HomePage
        }
    };

    if (vehicles.length === 0) {
        return <p>Нет автомобилей. Добавьте первый!</p>;
    }

    return (
        <ul style={{ listStyle: 'none', padding: 0 }}>
            {vehicles.map(vehicle => {
                const status = getVehicleStatus(vehicle);
                const icon = statusIcons[status] || '⚪';

                return (
                    <li
                        key={vehicle.id}
                        style={{
                            marginBottom: '10px',
                            padding: '10px',
                            backgroundColor: selectedId === vehicle.id ? '#e0e0e0' : '#f5f5f5',
                            borderRadius: '5px',
                            border: '1px solid #ddd',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                            {/* Левая часть - кликабельная */}
                            <div
                                style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, cursor: 'pointer' }}
                                onClick={() => onSelect(vehicle.id)}
                            >
                                <span style={{ fontSize: '20px' }}>{icon}</span>
                                <span>
                                    {vehicle.brand} {vehicle.model} - {vehicle.current_km} км ({vehicle.plate_number})
                                    {status === 'unknown' && <span style={{ color: 'red', marginLeft: '6px' }}>*</span>}
                                </span>
                            </div>

                            {/* Правая часть - кнопки */}
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                {!showArchived ? (
                                    // Активные авто - полный набор кнопок
                                    <>
                                        {/* Кнопка редактирования */}
                                        <button
                                            onClick={() => onEditVehicle(vehicle)}
                                            style={{
                                                padding: '5px 10px',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                backgroundColor: '#17a2b8',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '3px'
                                            }}
                                            title="Редактировать"
                                        >
                                            ✏️
                                        </button>

                                        {/* Кнопка удаления (мягкое) */}
                                        <button
                                            onClick={() => onDeleteVehicle(vehicle.id)}
                                            style={{
                                                padding: '5px 10px',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                backgroundColor: '#ffc107',
                                                color: '#000',
                                                border: 'none',
                                                borderRadius: '3px'
                                            }}
                                            title="Удалить (в архив)"
                                        >
                                            🗑️
                                        </button>

                                        {/* Кнопка обновления пробега */}
                                        {editingKm === vehicle.id ? (
                                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                                <input
                                                    type="number"
                                                    value={newKmValue}
                                                    onChange={(e) => setNewKmValue(e.target.value)}
                                                    placeholder="Новый пробег"
                                                    style={{ width: '120px', padding: '5px', boxSizing: 'border-box' }}
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => handleUpdateKm(vehicle.id, vehicle.current_km)}
                                                    style={{
                                                        padding: '5px 10px',
                                                        backgroundColor: '#28a745',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '3px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingKm(null);
                                                        setNewKmValue('');
                                                    }}
                                                    style={{
                                                        padding: '5px 10px',
                                                        backgroundColor: '#6c757d',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '3px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setEditingKm(vehicle.id)}
                                                style={{
                                                    padding: '5px 10px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer',
                                                    backgroundColor: '#007bff',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '3px'
                                                }}
                                                title="Обновить пробег"
                                            >
                                                📍
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    // Архивные авто - только восстановление и жесткое удаление
                                    <>
                                        <button
                                            onClick={() => onRestoreVehicle(vehicle.id)}
                                            style={{
                                                padding: '5px 10px',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                backgroundColor: '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '3px'
                                            }}
                                            title="Восстановить из архива"
                                        >
                                            ↩️
                                        </button>
                                        <button
                                            onClick={() => onHardDeleteVehicle(vehicle.id)}
                                            style={{
                                                padding: '5px 10px',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '3px'
                                            }}
                                            title="Полностью удалить из базы данных"
                                        >
                                            💀
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}