import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import type { RimSize, TireSize, Vehicle } from '../types';
import { VehicleSizesFields } from './VehicleSizesFields';

interface Props {
  vehicle: Vehicle;
  onUpdate: () => void;
}

export function ReferenceSizesPanel({ vehicle, onUpdate }: Props) {
  const { toast } = useToast();
  const [rims, setRims] = useState<RimSize[]>(vehicle.rims ?? []);
  const [tires, setTires] = useState<TireSize[]>(vehicle.tires ?? []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRims(vehicle.rims ?? []);
    setTires(vehicle.tires ?? []);
  }, [vehicle]);

  const readOnly = vehicle.is_active === false;

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateVehicleSizes(vehicle.id, {
        rims: rims.map(rim => ({
          ...rim,
          pcd: rim.pcd?.trim() || '',
        })),
        tires: tires
          .map(tire => ({ size: tire.size.trim(), label: tire.label?.trim() || null }))
          .filter(tire => tire.size !== ''),
      });
      toast.success('Размеры колёс и дисков сохранены');
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось сохранить размеры');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {readOnly && (
        <p className="text-body-sm text-outline m-0">
          Автомобиль в архиве — размеры доступны только для чтения.
        </p>
      )}

      <fieldset disabled={readOnly} className="m-0 p-0 border-0 min-w-0">
        <VehicleSizesFields
          rims={rims}
          tires={tires}
          onRimsChange={setRims}
          onTiresChange={setTires}
          collapsible={false}
        />
      </fieldset>

      {!readOnly && (
        <button type="button" onClick={handleSave} disabled={saving} className="md3-btn-primary w-full">
          {saving ? 'Сохранение...' : 'Сохранить колёса и диски'}
        </button>
      )}
    </div>
  );
}
