import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { VehicleList } from '../components/VehicleList';
import { ReplacementList } from '../components/ReplacementList';
import { VehicleForm } from '../components/VehicleForm';
import { EditVehicleForm } from '../components/EditVehicleForm';
import type { Vehicle, VehicleFormData } from '../types';

export function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  const getVehicleStatus = (vehicle: Vehicle) => vehicle.vehicle_status || 'unknown';

  const statusIcons = {
    overdue: '🔴',
    critical: '🟠',
    warning: '🟡',
    good: '🟢',
    unknown: '⚪',
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-sm border-b border-outline-variant shadow-md3-1">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A6DFF" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <h1 className="text-title-md text-surface-on m-0">ChangeLiquid</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-body-md text-outline">
              <span className="sm:hidden font-bold">{user?.username?.[0]?.toUpperCase()}</span>
              <span className="hidden sm:inline">{user?.username}</span>
            </span>
            <button
              onClick={() => navigate('/profile')}
              className="md3-btn-tonal !py-2 !px-4 !rounded-md3-sm text-label-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              <span className="hidden sm:inline">Профиль</span>
            </button>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="md3-btn-text !py-2 !px-4 !rounded-md3-sm text-label-sm text-outline"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="md3-btn-primary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Добавить
            </button>
          </div>

          <div className="flex gap-2 bg-surface-variant/50 p-1 rounded-md3-md" role="tablist">
            <button
              onClick={() => setShowArchived(false)}
              role="tab"
              aria-selected={!showArchived}
              className={`px-4 py-2 rounded-md3-sm text-label-lg transition-all duration-200 ${
                !showArchived
                  ? 'bg-surface shadow-md3-1 text-primary'
                  : 'text-surface-on-variant hover:bg-surface-variant/50'
              }`}
            >
              Активные ({activeVehicles.length})
            </button>
            <button
              onClick={() => setShowArchived(true)}
              role="tab"
              aria-selected={showArchived}
              className={`px-4 py-2 rounded-md3-sm text-label-lg transition-all duration-200 ${
                showArchived
                  ? 'bg-surface shadow-md3-1 text-primary'
                  : 'text-surface-on-variant hover:bg-surface-variant/50'
              }`}
            >
              Архив ({archivedVehicles.length})
            </button>
          </div>
        </div>

        <VehicleList
          vehicles={showArchived ? archivedVehicles : activeVehicles}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onEditVehicle={handleEditVehicle}
          onHardDeleteVehicle={handleHardDeleteVehicle}
          onRestoreVehicle={handleRestoreVehicle}
          onUpdateKm={handleUpdateKm}
          showArchived={showArchived}
          statusIcons={statusIcons}
          getVehicleStatus={getVehicleStatus}
        />

        {selectedVehicle && (
          <div className="mt-6 animate-slide-up">
            <ReplacementList
              replacements={replacements}
              vehicleId={selectedId}
              selectedVehicle={selectedVehicle}
              onClose={() => setSelectedId(null)}
              onReplacementsUpdate={handleReplacementsUpdate}
            />
          </div>
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
          onDelete={async (id) => {
            try {
              await api.deleteVehicle(id);
              invalidateVehicles();
              if (selectedId === id) setSelectedId(null);
            } catch (error) {
              console.error('Ошибка при удалении:', error);
              alert('Не удалось удалить автомобиль');
            }
          }}
        />
      </main>
    </div>
  );
}
