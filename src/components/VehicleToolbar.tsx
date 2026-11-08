import { Tabs, type TabItem } from './Tabs';

type ArchiveTab = 'active' | 'archived';

interface Props {
  showArchived: boolean;
  onShowArchivedChange: (value: boolean) => void;
  activeCount: number;
  archivedCount: number;
  onAddVehicle: () => void;
}

const archiveTabs: TabItem<ArchiveTab>[] = [
  { value: 'active', label: 'Активные' },
  { value: 'archived', label: 'Архив' },
];

export function VehicleToolbar({
  showArchived,
  onShowArchivedChange,
  activeCount,
  archivedCount,
  onAddVehicle,
}: Props) {
  const items = archiveTabs.map(item => ({
    ...item,
    label: `${item.label} (${item.value === 'active' ? activeCount : archivedCount})`,
  }));

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <button onClick={onAddVehicle} className="md3-btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Добавить
        </button>
      </div>

      <Tabs
        items={items}
        value={showArchived ? 'archived' : 'active'}
        onChange={value => onShowArchivedChange(value === 'archived')}
        ariaLabel="Активные и архивные автомобили"
      />
    </div>
  );
}
