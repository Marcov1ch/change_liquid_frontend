import type { Vehicle } from '../types';
import { Spoiler } from './Spoiler';
import { VehicleCardHeader } from './VehicleCardHeader';
import { ReferenceComponentsPanel } from './ReferenceComponentsPanel';
import { ReferenceSizesPanel } from './ReferenceSizesPanel';

interface Props {
  vehicle: Vehicle;
  onClose: () => void;
  onShare: () => void;
  onUpdate: () => void;
}

export function ReferenceTab({ vehicle, onClose, onShare, onUpdate }: Props) {
  return (
    <div className="md3-card overflow-hidden animate-fade-in">
      <VehicleCardHeader
        vehicle={vehicle}
        title={`Справочник: ${vehicle.brand} ${vehicle.model}`}
        onClose={onClose}
        onShare={onShare}
      />

      <div className="p-4 flex flex-col gap-4">
        <section>
          <h3 className="text-title-sm text-surface-on m-0 mb-1">Компоненты</h3>
          <p className="text-body-sm text-outline m-0 mb-3">
            Интервалы по умолчанию уже подставлены. Отметьте, о чём напоминать.
          </p>
          <ReferenceComponentsPanel vehicle={vehicle} onUpdate={onUpdate} />
        </section>

        <Spoiler
          title="Колёса и диски"
          summary={`Диски: ${vehicle.rims.length} · Шины: ${vehicle.tires.length}`}
        >
          <ReferenceSizesPanel vehicle={vehicle} onUpdate={onUpdate} />
        </Spoiler>
      </div>
    </div>
  );
}
