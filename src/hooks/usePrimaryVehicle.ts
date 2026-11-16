import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Vehicle } from '../types';

export function usePrimaryVehicle(active: Vehicle[]) {
  const { user, setPrimaryVehicle } = useAuth();
  const primary = active.find(vehicle => vehicle.id === user?.primary_vehicle_id) ?? active[0] ?? null;

  useEffect(() => {
    if (active.length === 1 && user?.primary_vehicle_id == null) {
      void setPrimaryVehicle(active[0].id).catch(() => undefined);
    }
  }, [active, setPrimaryVehicle, user?.primary_vehicle_id]);

  return {
    primary,
    primaryId: primary?.id ?? null,
    isPrimary: (vehicle: Vehicle) => primary?.id === vehicle.id,
  };
}
