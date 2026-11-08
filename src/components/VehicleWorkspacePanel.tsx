import type { Vehicle } from '../types';
import type { VehicleWorkspace, WorkspaceTab } from '../hooks/useVehicleWorkspace';
import { FuelRecordsList } from './FuelRecordsList';
import { OtherExpensesList } from './OtherExpensesList';
import { ReplacementList } from './ReplacementList';
import { RepairList } from './RepairList';
import { StatisticsPanel } from './StatisticsPanel';
import { Tabs, type TabItem } from './Tabs';
import { VehicleCardHeader } from './VehicleCardHeader';

interface Props {
  workspace: VehicleWorkspace;
  onShare: (vehicle: Vehicle) => void;
}

export function VehicleWorkspacePanel({ workspace, onShare }: Props) {
  const {
    selectedId,
    selectedVehicle,
    activeTab,
    setActiveTab,
    closeVehicle,
    replacements,
    fuelRecords,
    repairs,
    otherExpenses,
    handleReplacementsUpdate,
    handleRepairsUpdate,
    handleFuelRecordsUpdate,
    invalidateOtherExpenses,
  } = workspace;

  if (!selectedVehicle) return null;

  const tabItems: TabItem<WorkspaceTab>[] = [
    { value: 'replacements', label: `Замены (${replacements.length})` },
    { value: 'fuelRecords', label: `Заправки (${fuelRecords.length})` },
    { value: 'repairs', label: `Ремонт или обслуживание (${repairs.length})` },
    { value: 'otherExpenses', label: `Прочие траты (${otherExpenses.length})` },
    { value: 'statistics', label: 'Статистика' },
  ];

  const share = () => onShare(selectedVehicle);

  return (
    <div className="mt-6 animate-slide-up">
      <Tabs
        items={tabItems}
        value={activeTab}
        onChange={setActiveTab}
        className="mb-3"
        ariaLabel="Разделы автомобиля"
      />

      {activeTab === 'replacements' && (
        <ReplacementList
          replacements={replacements}
          repairs={repairs}
          vehicleId={selectedId}
          selectedVehicle={selectedVehicle}
          onClose={closeVehicle}
          onShare={share}
          onReplacementsUpdate={handleReplacementsUpdate}
        />
      )}

      {activeTab === 'fuelRecords' && (
        <FuelRecordsList
          records={fuelRecords}
          vehicleId={selectedId}
          selectedVehicle={selectedVehicle}
          onClose={closeVehicle}
          onShare={share}
          onRecordsUpdate={handleFuelRecordsUpdate}
        />
      )}

      {activeTab === 'repairs' && (
        <RepairList
          repairs={repairs}
          replacements={replacements}
          vehicleId={selectedId}
          selectedVehicle={selectedVehicle}
          onClose={closeVehicle}
          onShare={share}
          onRepairsUpdate={handleRepairsUpdate}
        />
      )}

      {activeTab === 'otherExpenses' && (
        <OtherExpensesList
          expenses={otherExpenses}
          vehicleId={selectedId}
          selectedVehicle={selectedVehicle}
          onClose={closeVehicle}
          onShare={share}
          onExpensesUpdate={invalidateOtherExpenses}
        />
      )}

      {activeTab === 'statistics' && (
        <div className="md3-card overflow-hidden animate-fade-in">
          <VehicleCardHeader
            vehicle={selectedVehicle}
            title={`Статистика: ${selectedVehicle.brand} ${selectedVehicle.model}`}
            onClose={closeVehicle}
            onShare={share}
          />
          <div className="p-4">
            <StatisticsPanel
              replacements={replacements}
              repairs={repairs}
              fuelRecords={fuelRecords}
              otherExpenses={otherExpenses}
            />
          </div>
        </div>
      )}
    </div>
  );
}
