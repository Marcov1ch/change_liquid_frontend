import { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';
import type { Repair, Replacement, Vehicle } from '../../types';
import type { WorkspaceTab } from '../../hooks/useVehicleWorkspace';
import { ActionSheet, type ActionSheetItem } from '../ui/ActionSheet';
import { Sheet } from '../ui/Sheet';
import { ExpensesIcon, FuelIcon, RepairIcon, ReplacementsIcon, TireIcon } from '../icons/VehicleSectionIcons';
import { FuelRecordForm } from '../FuelRecordForm';
import { OtherExpenseForm } from '../OtherExpenseForm';
import { RepairForm } from '../RepairForm';
import { TireSetForm } from '../TireSetForm';
import { QuickAddKmForm } from './QuickAddKmForm';
import { QuickAddReplacementForm } from './QuickAddReplacementForm';

type QuickAddType = 'fuel' | 'repairs' | 'replacements' | 'expenses' | 'km' | 'tires';

interface Props {
  vehicle: Vehicle;
  section?: WorkspaceTab;
  repairs?: Repair[];
  replacements?: Replacement[];
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const SECTION_TO_TYPE: Partial<Record<WorkspaceTab, QuickAddType>> = {
  fuelRecords: 'fuel',
  repairs: 'repairs',
  replacements: 'replacements',
  otherExpenses: 'expenses',
  tires: 'tires',
};

const KM_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 12l4-4" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

export function QuickAddSheet({
  vehicle,
  section,
  repairs = [],
  replacements = [],
  isOpen,
  onClose,
  onSaved,
}: Props) {
  const { toast } = useToast();
  const [type, setType] = useState<QuickAddType | null>(null);
  const today = new Date().toISOString().split('T')[0];
  const activeType = section ? SECTION_TO_TYPE[section] : undefined;

  useEffect(() => {
    if (!isOpen) setType(null);
  }, [isOpen]);

  const items: ActionSheetItem[] = [
    { id: 'fuel', label: 'Заправка', icon: <FuelIcon />, selected: activeType === 'fuel' },
    { id: 'repairs', label: 'Ремонт', icon: <RepairIcon />, selected: activeType === 'repairs' },
    { id: 'replacements', label: 'Замена', icon: <ReplacementsIcon />, selected: activeType === 'replacements' },
    { id: 'expenses', label: 'Прочие траты', icon: <ExpensesIcon />, selected: activeType === 'expenses' },
    { id: 'km', label: 'Пробег', icon: KM_ICON, selected: activeType === 'km' },
    ...(section === 'tires' ? [{ id: 'tires', label: 'Шины', icon: <TireIcon />, selected: true }] : []),
  ];

  const finish = () => {
    setType(null);
    onClose();
    onSaved();
  };

  return (
    <>
      <ActionSheet
        isOpen={isOpen && type === null}
        onClose={onClose}
        title={`${vehicle.brand} ${vehicle.model}`}
        description="Что добавить?"
        items={items}
        onSelect={(id) => setType(id as QuickAddType)}
      />

      <Sheet
        isOpen={isOpen && type !== null}
        onClose={() => {
          setType(null);
          onClose();
        }}
        title={items.find(item => item.id === type)?.label ?? 'Новая запись'}
      >
        {type === 'fuel' && (
          <FuelRecordForm
            vehicle={vehicle}
            today={today}
            onCancel={() => setType(null)}
            onSubmit={async (payload) => {
              await api.createFuelRecord(vehicle.id, payload);
              toast.success('Заправка добавлена');
              finish();
            }}
          />
        )}

        {type === 'expenses' && (
          <OtherExpenseForm
            today={today}
            onCancel={() => setType(null)}
            onSubmit={async (payload) => {
              await api.createOtherExpense(vehicle.id, payload);
              toast.success('Трата добавлена');
              finish();
            }}
          />
        )}

        {type === 'repairs' && (
          <RepairForm
            vehicle={vehicle}
            replacements={replacements}
            today={today}
            onCancel={() => setType(null)}
            onSubmit={async (payload) => {
              await api.createRepair(vehicle.id, payload);
              toast.success('Ремонт добавлен');
              finish();
            }}
          />
        )}

        {type === 'tires' && (
          <TireSetForm
            today={today}
            onCancel={() => setType(null)}
            onSubmit={async (payload) => {
              await api.createTireSet(vehicle.id, payload);
              toast.success('Комплект добавлен');
              finish();
            }}
          />
        )}

        {type === 'km' && (
          <QuickAddKmForm
            vehicle={vehicle}
            onCancel={() => setType(null)}
            onSubmit={async (newKm) => {
              await api.updateVehicleKm(vehicle.id, newKm);
              toast.success('Пробег обновлён');
              finish();
            }}
          />
        )}

        {type === 'replacements' && (
          <QuickAddReplacementForm
            vehicle={vehicle}
            repairs={repairs}
            onCancel={() => setType(null)}
            onSaved={finish}
          />
        )}
      </Sheet>
    </>
  );
}
