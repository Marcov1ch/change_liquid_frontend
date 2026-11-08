import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export type WorkspaceTab =
  | 'replacements'
  | 'fuelRecords'
  | 'repairs'
  | 'otherExpenses'
  | 'statistics';

export function useVehicleWorkspace() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('replacements');
  const [showArchived, setShowArchived] = useState(false);

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: api.getAllVehicles,
  });

  const { data: replacements = [] } = useQuery({
    queryKey: ['replacements', selectedId],
    queryFn: () => api.getReplacements(selectedId!),
    enabled: !!selectedId,
  });

  const { data: fuelRecords = [] } = useQuery({
    queryKey: ['fuel-records', selectedId],
    queryFn: () => api.getFuelRecords(selectedId!),
    enabled: !!selectedId,
  });

  const { data: repairs = [] } = useQuery({
    queryKey: ['repairs', selectedId],
    queryFn: () => api.getRepairs(selectedId!),
    enabled: !!selectedId,
  });

  const { data: otherExpenses = [] } = useQuery({
    queryKey: ['other-expenses', selectedId],
    queryFn: () => api.getOtherExpenses(selectedId!),
    enabled: !!selectedId,
  });

  const selectedVehicle = vehicles.find(vehicle => vehicle.id === selectedId);
  const activeVehicles = vehicles.filter(vehicle => vehicle.is_active !== false);
  const archivedVehicles = vehicles.filter(vehicle => vehicle.is_active === false);

  const invalidateVehicles = () => {
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
  };
  const invalidateReplacements = () => {
    if (selectedId) queryClient.invalidateQueries({ queryKey: ['replacements', selectedId] });
  };
  const invalidateOtherExpenses = () => {
    if (selectedId) queryClient.invalidateQueries({ queryKey: ['other-expenses', selectedId] });
  };

  const handleReplacementsUpdate = () => {
    invalidateReplacements();
    invalidateVehicles();
  };

  const handleVehicleUpdate = () => {
    invalidateVehicles();
    invalidateReplacements();
  };

  const handleRepairsUpdate = () => {
    if (selectedId) queryClient.invalidateQueries({ queryKey: ['repairs', selectedId] });
    invalidateReplacements();
    invalidateVehicles();
  };

  const handleFuelRecordsUpdate = () => {
    if (selectedId) queryClient.invalidateQueries({ queryKey: ['fuel-records', selectedId] });
    invalidateReplacements();
    invalidateVehicles();
  };

  const selectVehicle = (id: number) => {
    setSelectedId(id);
    setActiveTab('replacements');
  };

  const closeVehicle = () => {
    setSelectedId(null);
    setActiveTab('replacements');
  };

  return {
    selectedId,
    selectedVehicle,
    vehicles,
    activeVehicles,
    archivedVehicles,
    showArchived,
    setShowArchived,
    activeTab,
    setActiveTab,
    selectVehicle,
    closeVehicle,
    replacements,
    fuelRecords,
    repairs,
    otherExpenses,
    invalidateVehicles,
    invalidateReplacements,
    invalidateOtherExpenses,
    handleReplacementsUpdate,
    handleVehicleUpdate,
    handleRepairsUpdate,
    handleFuelRecordsUpdate,
  };
}

export type VehicleWorkspace = ReturnType<typeof useVehicleWorkspace>;
