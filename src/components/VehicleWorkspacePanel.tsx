import type { Vehicle } from '../types';
import type { VehicleWorkspace, WorkspaceTab } from '../hooks/useVehicleWorkspace';
import {
  ExpensesIcon,
  FuelIcon,
  RepairIcon,
  ReplacementsIcon,
  TireIcon,
} from './icons/VehicleSectionIcons';
import { FuelRecordsList } from './FuelRecordsList';
import { OtherExpensesList } from './OtherExpensesList';
import { ReplacementList } from './ReplacementList';
import { RepairList } from './RepairList';
import { TireSetsPanel } from './TireSetsPanel';
import { Tabs, type TabItem } from './Tabs';
import { getTireStatusMeta } from '../utils/tireSets';

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
    tireSets,
    fuelRecords,
    repairs,
    otherExpenses,
    handleReplacementsUpdate,
    handleRepairsUpdate,
    handleFuelRecordsUpdate,
    handleTireSetsUpdate,
    invalidateOtherExpenses,
  } = workspace;

  if (!selectedVehicle) return null;

  const hasTireSets = tireSets.length > 0;
  const visibleReplacements = hasTireSets
    ? replacements.filter(replacement => replacement.component_type !== 'tire_change')
    : replacements;

  const currentTireSet = tireSets.find(item => item.is_installed);
  const tireNeedsAttention = currentTireSet?.status === 'warning'
    || currentTireSet?.status === 'critical'
    || currentTireSet?.status === 'overdue';
  const tireStatus = getTireStatusMeta(currentTireSet?.status);

  const tabItems: TabItem<WorkspaceTab>[] = [
    {
      value: 'replacements',
      label: `Замены (${visibleReplacements.length})`,
      icon: <ReplacementsIcon />,
    },
    {
      value: 'tires',
      label: `Шины (${tireSets.length})`,
      icon: (
        <span className="relative inline-flex">
          <TireIcon />
          {tireNeedsAttention && (
            <span
              className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-surface ${tireStatus.dotClass}`}
              aria-hidden="true"
            />
          )}
        </span>
      ),
    },
    {
      value: 'fuelRecords',
      label: `Заправки (${fuelRecords.length})`,
      icon: <FuelIcon />,
    },
    {
      value: 'repairs',
      label: `Ремонт или обслуживание (${repairs.length})`,
      icon: <RepairIcon />,
    },
    {
      value: 'otherExpenses',
      label: `Прочие траты (${otherExpenses.length})`,
      icon: <ExpensesIcon />,
    },
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
        iconOnlyMobile
        stretch
      />

      {activeTab === 'replacements' && (
        <ReplacementList
          replacements={visibleReplacements}
          repairs={repairs}
          vehicleId={selectedId}
          selectedVehicle={selectedVehicle}
          onClose={closeVehicle}
          onShare={share}
          onReplacementsUpdate={handleReplacementsUpdate}
        />
      )}

      {activeTab === 'tires' && (
        <TireSetsPanel
          tireSets={tireSets}
          replacements={replacements}
          vehicleId={selectedId}
          selectedVehicle={selectedVehicle}
          onClose={closeVehicle}
          onShare={share}
          onTireSetsUpdate={handleTireSetsUpdate}
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

    </div>
  );
}
