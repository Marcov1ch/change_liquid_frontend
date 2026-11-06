import type { Vehicle } from '../types';
import { VehicleSectionPlaceholder } from './VehicleSectionPlaceholder';

interface Props {
  selectedVehicle: Vehicle;
  onClose: () => void;
}

export function RepairList({ selectedVehicle, onClose }: Props) {
  return (
    <VehicleSectionPlaceholder
      vehicle={selectedVehicle}
      title="Ремонт или обслуживание"
      icon="🛠️"
      description="Здесь будет история ремонтов и обслуживания автомобиля. Функциональность появится в следующем обновлении."
      onClose={onClose}
    />
  );
}
