import type { Vehicle } from '../types';
import { Spoiler } from './Spoiler';
import { VehicleCardHeader } from './VehicleCardHeader';
import { ReferenceComponentsPanel } from './ReferenceComponentsPanel';
import { ReferenceIntervalsPanel } from './ReferenceIntervalsPanel';
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
          <h3 className="text-title-sm text-surface-on m-0 mb-3">Компоненты и допуски</h3>
          <ReferenceComponentsPanel vehicle={vehicle} onUpdate={onUpdate} />
        </section>

        <Spoiler
          title="Интервалы и уведомления"
          summary="Значения по умолчанию подставлены автоматически"
        >
          <ReferenceIntervalsPanel vehicle={vehicle} onUpdate={onUpdate} />
        </Spoiler>

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
