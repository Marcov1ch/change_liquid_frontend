import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { HomeHeader } from '../components/HomeHeader';
import { VehicleList } from '../components/VehicleList';
import { VehicleToolbar } from '../components/VehicleToolbar';
import { VehicleWorkspacePanel } from '../components/VehicleWorkspacePanel';
import { VehicleForm } from '../components/VehicleForm';
import { EditVehicleForm } from '../components/EditVehicleForm';
import { ShareVehicleDialog } from '../components/ShareVehicleDialog';
import { TrackingBar } from '../components/TrackingBar';
import { VehicleStatisticsDialog } from '../components/VehicleStatisticsDialog';
import { QuickAddSheet } from '../components/quickadd/QuickAddSheet';
import { useGpsTracker } from '../hooks/useGpsTracker';
import { usePrimaryVehicle } from '../hooks/usePrimaryVehicle';
import { useVehicleActions } from '../hooks/useVehicleActions';
import { useVehicleWorkspace } from '../hooks/useVehicleWorkspace';
import type { Vehicle } from '../types';

const statusIcons = {
  overdue: '🔴',
  critical: '🟠',
  warning: '🟡',
  good: '🟢',
  unknown: '⚪',
};

function getVehicleStatus(vehicle: Vehicle): string {
  return vehicle.vehicle_status || 'unknown';
}

export function HomePage() {
  const workspace = useVehicleWorkspace();
  const actions = useVehicleActions(workspace);
  const { toast } = useToast();
  const { setPrimaryVehicle } = useAuth();
  const queryClient = useQueryClient();
  const gps = useGpsTracker((message) => toast.error(message));
  const { primary, isPrimary } = usePrimaryVehicle(workspace.activeVehicles);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const target = workspace.selectedVehicle ?? primary;
  const canQuickAdd = !!target && target.is_active !== false;

  const handleStartTrip = async (vehicleId: number) => {
    try {
      await gps.startTracking(vehicleId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось запустить GPS');
    }
  };

  const handleStopTrip = async () => {
    const result = await gps.stopTracking();
    if (!result || !result.vehicleId) return;

    const vehicle = workspace.vehicles.find(item => item.id === result.vehicleId);
    if (!vehicle) return;

    const newKm = Math.round(vehicle.current_km + result.distanceKm);
    await actions.handleUpdateKm(result.vehicleId, newKm);
  };

  return (
    <div className="min-h-screen bg-surface">
      <HomeHeader />

      <main className="max-w-5xl mx-auto px-4 py-6 pb-28">
        <VehicleToolbar
          showArchived={workspace.showArchived}
          onShowArchivedChange={workspace.setShowArchived}
          activeCount={workspace.activeVehicles.length}
          archivedCount={workspace.archivedVehicles.length}
        />

        <VehicleList
          vehicles={workspace.showArchived ? workspace.archivedVehicles : workspace.activeVehicles}
          selectedId={workspace.selectedId}
          onSelect={workspace.selectVehicle}
          onEditVehicle={actions.handleEditVehicle}
          onOpenStatistics={actions.openStatistics}
          onHardDeleteVehicle={actions.handleHardDeleteVehicle}
          onRestoreVehicle={actions.handleRestoreVehicle}
          onUpdateKm={actions.handleUpdateKm}
          onStartTrip={handleStartTrip}
          trackingVehicleId={gps.isTracking ? gps.vehicleId : null}
          showArchived={workspace.showArchived}
          primaryId={primary?.id ?? null}
          statusIcons={statusIcons}
          getVehicleStatus={getVehicleStatus}
        />

        {!workspace.showArchived && workspace.activeVehicles.length === 0 && (
          <button
            type="button"
            onClick={actions.openCreateForm}
            className="md3-btn-tonal w-full mt-3"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Добавить автомобиль
          </button>
        )}

        <VehicleWorkspacePanel workspace={workspace} onShare={actions.openShare} />

        <VehicleForm
          isOpen={actions.showForm}
          onClose={actions.closeCreateForm}
          onSubmit={actions.handleAddVehicle}
        />

        <EditVehicleForm
          isOpen={actions.showEditForm}
          onClose={actions.closeEditForm}
          vehicle={actions.editingVehicle}
          onUpdate={workspace.handleVehicleUpdate}
          onDelete={actions.handleDeleteVehicle}
          isPrimary={actions.editingVehicle ? isPrimary(actions.editingVehicle) : false}
          onSetPrimary={async (id) => {
            await setPrimaryVehicle(id);
            workspace.invalidateVehicles();
          }}
        />

        <ShareVehicleDialog
          vehicle={actions.shareVehicle}
          onClose={actions.closeShare}
        />

        <VehicleStatisticsDialog
          vehicle={actions.statsVehicle}
          onClose={actions.closeStatistics}
        />

        {target && (
          <QuickAddSheet
            vehicle={target}
            section={workspace.selectedVehicle ? workspace.activeTab : undefined}
            repairs={workspace.selectedVehicle ? workspace.repairs : []}
            replacements={workspace.selectedVehicle ? workspace.replacements : []}
            isOpen={quickAddOpen}
            onClose={() => setQuickAddOpen(false)}
            onSaved={() => {
              void queryClient.invalidateQueries();
            }}
          />
        )}

        {canQuickAdd && (
          <button
            type="button"
            onClick={() => setQuickAddOpen(true)}
            aria-label="Добавить запись"
            title="Добавить запись"
            className="fixed right-4 bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-md3-full bg-primary text-primary-on shadow-md3-3 transition-transform duration-150 hover:scale-105 active:scale-95"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        )}

        <TrackingBar
          tracking={gps}
          onStop={() => { void handleStopTrip(); }}
        />
      </main>
    </div>
  );
}
