import { Tabs, type TabItem } from './Tabs';

type ArchiveTab = 'active' | 'archived';

interface Props {
  showArchived: boolean;
  onShowArchivedChange: (value: boolean) => void;
  activeCount: number;
  archivedCount: number;
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
}: Props) {
  const items = archiveTabs.map(item => ({
    ...item,
    label: `${item.label} (${item.value === 'active' ? activeCount : archivedCount})`,
  }));

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <Tabs
        items={items}
        value={showArchived ? 'archived' : 'active'}
        onChange={value => onShowArchivedChange(value === 'archived')}
        ariaLabel="Активные и архивные автомобили"
      />
    </div>
  );
}
