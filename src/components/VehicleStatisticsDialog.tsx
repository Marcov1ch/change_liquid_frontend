import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Vehicle } from '../types';
import { Modal } from './Modal';
import { StatisticsPanel } from './StatisticsPanel';

interface Props {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export function VehicleStatisticsDialog({ vehicle, onClose }: Props) {
  const vehicleId = vehicle?.id;

  const { data: replacements = [], isLoading: replacementsLoading } = useQuery({
    queryKey: ['replacements', vehicleId],
    queryFn: () => api.getReplacements(vehicleId!),
    enabled: !!vehicleId,
  });

  const { data: repairs = [], isLoading: repairsLoading } = useQuery({
    queryKey: ['repairs', vehicleId],
    queryFn: () => api.getRepairs(vehicleId!),
    enabled: !!vehicleId,
  });

  const { data: fuelRecords = [], isLoading: fuelLoading } = useQuery({
    queryKey: ['fuel-records', vehicleId],
    queryFn: () => api.getFuelRecords(vehicleId!),
    enabled: !!vehicleId,
  });

  const { data: otherExpenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['other-expenses', vehicleId],
    queryFn: () => api.getOtherExpenses(vehicleId!),
    enabled: !!vehicleId,
  });

  const isLoading = replacementsLoading || repairsLoading || fuelLoading || expensesLoading;
  const title = vehicle
    ? `Статистика: ${vehicle.brand} ${vehicle.model}`
    : 'Статистика';

  return (
    <Modal isOpen={!!vehicle} onClose={onClose} title={title} size="xl">
      {isLoading ? (
        <div className="py-10 text-center text-outline">Загрузка статистики...</div>
      ) : (
        <StatisticsPanel
          replacements={replacements}
          repairs={repairs}
          fuelRecords={fuelRecords}
          otherExpenses={otherExpenses}
        />
      )}
    </Modal>
  );
}
