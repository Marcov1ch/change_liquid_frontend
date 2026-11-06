import type { Vehicle } from '../types';
import { VehicleSectionPlaceholder } from './VehicleSectionPlaceholder';

interface Props {
  selectedVehicle: Vehicle;
  onClose: () => void;
}

export function OtherExpensesList({ selectedVehicle, onClose }: Props) {
  return (
    <VehicleSectionPlaceholder
      vehicle={selectedVehicle}
      title="Прочие траты"
      icon="💸"
      description="Здесь будут почасовая парковка, штрафы и мойка автомобиля. Функциональность появится в следующем обновлении."
      onClose={onClose}
    />
  );
}
