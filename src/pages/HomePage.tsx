import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { VehicleList } from '../components/VehicleList';
import { ReplacementList } from '../components/ReplacementList';
import { VehicleForm } from '../components/VehicleForm';
import { EditVehicleForm } from '../components/EditVehicleForm';
import type { Vehicle, Replacement, VehicleFormData } from '../types';

export function HomePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [replacements, setReplacements] = useState<Replacement[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showArchived, setShowArchived] = useState(false);

    const selectedVehicle = vehicles.find(v => v.id === selectedId);

    // Разделяем на активные и архивные
    const activeVehicles = vehicles.filter(v => {
        console.log('Авто:', v.id, 'is_active:', v.is_active);
        return v.is_active !== false;
    });
    const archivedVehicles = vehicles.filter(v => v.is_active === false);

    const loadAllVehicles = async () => {
        const data = await api.getAllVehicles();  // все авто (активные + архивные)
        console.log('Загружено авто:', data);
        setVehicles(data);
    };

    const loadReplacements = async () => {
        if (selectedId) {
            const data = await api.getReplacements(selectedId);
            setReplacements(data);
        } else {
            setReplacements([]);
        }
    };

    useEffect(() => {
        loadAllVehicles();
    }, []);

    useEffect(() => {
        loadReplacements();
    }, [selectedId]);

    const handleAddVehicle = async (newVehicle: VehicleFormData) => {
        try {
            await api.createVehicle(newVehicle);
            await loadAllVehicles();
            setShowForm(false);
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            }
        }
    };

    const handleReplacementsUpdate = async () => {
        await loadReplacements();
        await loadAllVehicles();
    };

    const handleVehicleUpdate = async () => {
        await loadAllVehicles();
        if (selectedId) {
            await loadReplacements();
        }
    };

    const handleEditVehicle = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setShowEditForm(true);
    };

    const handleDeleteVehicle = async (id: number) => {
        if (!confirm('Удалить автомобиль? (можно будет восстановить)')) return;
        try {
            await api.deleteVehicle(id);
            await loadAllVehicles();
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
            await loadAllVehicles();
            if (selectedId === id) setSelectedId(null);
        } catch (error) {
            console.error('Ошибка при жестком удалении:', error);
            alert('Не удалось удалить автомобиль');
        }
    };

    const handleRestoreVehicle = async (id: number) => {
        try {
            await api.restoreVehicle(id);
            await loadAllVehicles();
        } catch (error) {
            console.error('Ошибка при восстановлении:', error);
            alert('Не удалось восстановить автомобиль');
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
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>Мои автомобили</h1>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span>{user?.username}</span>
                    <Link
                        to="/profile"
                        style={{
                            padding: '6px 14px', fontSize: 14, cursor: 'pointer',
                            backgroundColor: '#007bff', color: 'white',
                            textDecoration: 'none', border: 'none', borderRadius: 5
                        }}
                    >
                        Профиль
                    </Link>
                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        style={{
                            padding: '6px 14px', fontSize: 14, cursor: 'pointer',
                            backgroundColor: '#6c757d', color: 'white',
                            border: 'none', borderRadius: 5
                        }}
                    >
                        Выйти
                    </button>
                </div>
            </div>

            <button
                onClick={() => setShowForm(true)}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    marginBottom: '20px',
                    cursor: 'pointer',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px'
                }}
            >
                + Добавить автомобиль
            </button>

            {/* Переключатель вкладок */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                <button
                    onClick={() => setShowArchived(false)}
                    style={{
                        padding: '8px 16px',
                        cursor: 'pointer',
                        backgroundColor: !showArchived ? '#007bff' : '#f0f0f0',
                        color: !showArchived ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '5px'
                    }}
                >
                    Активные ({activeVehicles.length})
                </button>
                <button
                    onClick={() => setShowArchived(true)}
                    style={{
                        padding: '8px 16px',
                        cursor: 'pointer',
                        backgroundColor: showArchived ? '#007bff' : '#f0f0f0',
                        color: showArchived ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '5px'
                    }}
                >
                    Архив ({archivedVehicles.length})
                </button>
            </div>

            <VehicleList
                vehicles={showArchived ? archivedVehicles : activeVehicles}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onVehicleUpdate={handleVehicleUpdate}
                onEditVehicle={handleEditVehicle}
                onDeleteVehicle={handleDeleteVehicle}
                onHardDeleteVehicle={handleHardDeleteVehicle}
                onRestoreVehicle={handleRestoreVehicle}
                showArchived={showArchived}
                statusIcons={statusIcons}
                getVehicleStatus={getVehicleStatus}
            />

            <ReplacementList
                replacements={replacements}
                vehicleId={selectedId}
                selectedVehicle={selectedVehicle}
                onClose={() => setSelectedId(null)}
                onReplacementsUpdate={handleReplacementsUpdate}
            />

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