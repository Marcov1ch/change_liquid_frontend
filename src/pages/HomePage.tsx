import { useToast } from '../context/ToastContext';
import { HomeHeader } from '../components/HomeHeader';
import { VehicleList } from '../components/VehicleList';
import { VehicleToolbar } from '../components/VehicleToolbar';
import { VehicleWorkspacePanel } from '../components/VehicleWorkspacePanel';
import { VehicleForm } from '../components/VehicleForm';
import { EditVehicleForm } from '../components/EditVehicleForm';
import { ShareVehicleDialog } from '../components/ShareVehicleDialog';
import { TrackingBar } from '../components/TrackingBar';
import { VehicleStatisticsDialog } from '../components/VehicleStatisticsDialog';
import { useGpsTracker } from '../hooks/useGpsTracker';
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
  const gps = useGpsTracker((message) => toast.error(message));

  const handleStartTrip = async (vehicleId: number) => {
    try {
      await gps.startTracking(vehicleId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось запустить GPS');
    }
  };

  const handleStopTrip = () => {
    const result = gps.stopTracking();
    if (!result || !result.vehicleId) return;

    const vehicle = workspace.vehicles.find(item => item.id === result.vehicleId);
    if (!vehicle) return;

    const newKm = Math.round(vehicle.current_km + result.distanceKm);
    void actions.handleUpdateKm(result.vehicleId, newKm);
  };

  return (
    <div className="min-h-screen bg-surface">
      <HomeHeader />

      <main className="max-w-5xl mx-auto px-4 py-6">
        <VehicleToolbar
          showArchived={workspace.showArchived}
          onShowArchivedChange={workspace.setShowArchived}
          activeCount={workspace.activeVehicles.length}
          archivedCount={workspace.archivedVehicles.length}
          onAddVehicle={actions.openCreateForm}
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
          statusIcons={statusIcons}
          getVehicleStatus={getVehicleStatus}
        />

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
        />

        <ShareVehicleDialog
          vehicle={actions.shareVehicle}
          onClose={actions.closeShare}
        />

        <VehicleStatisticsDialog
          vehicle={actions.statsVehicle}
          onClose={actions.closeStatistics}
        />

        <TrackingBar
          tracking={gps}
          onStop={handleStopTrip}
        />
      </main>
    </div>
  );
}
