import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import type { Vehicle, VehicleFormData } from '../types';
import type { VehicleWorkspace } from './useVehicleWorkspace';

export function useVehicleActions(workspace: VehicleWorkspace) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [shareVehicle, setShareVehicle] = useState<Vehicle | null>(null);

  const createVehicleMutation = useMutation({
    mutationFn: api.createVehicle,
    onSuccess: () => {
      workspace.invalidateVehicles();
      setShowForm(false);
    },
  });

  const updateKmMutation = useMutation({
    mutationFn: ({ vehicleId, newKm }: { vehicleId: number; newKm: number }) =>
      api.updateVehicleKm(vehicleId, newKm),
    onSuccess: () => {
      workspace.invalidateVehicles();
      workspace.invalidateReplacements();
    },
  });

  const handleAddVehicle = async (newVehicle: VehicleFormData) => {
    try {
      await createVehicleMutation.mutateAsync(newVehicle);
      toast.success('Автомобиль добавлен');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowEditForm(true);
  };

  const handleDeleteVehicle = async (id: number) => {
    try {
      await api.deleteVehicle(id);
      workspace.invalidateVehicles();
      if (workspace.selectedId === id) workspace.closeVehicle();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось удалить автомобиль');
    }
  };

  const handleHardDeleteVehicle = async (id: number) => {
    if (!confirm('ПОЛНОСТЬЮ удалить автомобиль из базы данных? Это действие необратимо!')) return;
    try {
      await api.hardDeleteVehicle(id);
      workspace.invalidateVehicles();
      if (workspace.selectedId === id) workspace.closeVehicle();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось удалить автомобиль');
    }
  };

  const handleRestoreVehicle = async (id: number) => {
    try {
      await api.restoreVehicle(id);
      toast.success('Автомобиль восстановлен');
      workspace.invalidateVehicles();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось восстановить автомобиль');
    }
  };

  const handleUpdateKm = async (vehicleId: number, newKm: number) => {
    try {
      await updateKmMutation.mutateAsync({ vehicleId, newKm });
      toast.success('Пробег обновлён');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось обновить пробег');
    }
  };

  return {
    showForm,
    editingVehicle,
    showEditForm,
    shareVehicle,
    openCreateForm: () => setShowForm(true),
    closeCreateForm: () => setShowForm(false),
    closeEditForm: () => setShowEditForm(false),
    openShare: (vehicle: Vehicle) => setShareVehicle(vehicle),
    closeShare: () => setShareVehicle(null),
    handleAddVehicle,
    handleEditVehicle,
    handleDeleteVehicle,
    handleHardDeleteVehicle,
    handleRestoreVehicle,
    handleUpdateKm,
  };
}
