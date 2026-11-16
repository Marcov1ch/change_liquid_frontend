import { useEffect, useMemo, useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { useComponentConfigs } from '../../hooks/useEnums';
import type { Repair, Vehicle } from '../../types';
import { buildReplacementPayload } from '../../utils/quickAdd';
import { findBlockingRepair } from '../../utils/repairConflicts';
import { AddReplacementForm, type NewReplacementData } from '../AddReplacementForm';

interface Props {
  vehicle: Vehicle;
  repairs: Repair[];
  onSaved: () => void;
  onCancel: () => void;
}

function initialData(vehicle: Vehicle, componentType: string): NewReplacementData {
  return {
    component_type: componentType,
    component_name: '',
    component_price: '',
    work_price: '',
    replacement_date: new Date().toISOString().split('T')[0],
    km_at_replacement: vehicle.current_km,
    next_change_date: '',
  };
}

export function QuickAddReplacementForm({ vehicle, repairs, onSaved, onCancel }: Props) {
  const { toast } = useToast();
  const { data: configsData } = useComponentConfigs();
  const configs = useMemo(() => configsData?.configs ?? [], [configsData]);
  const [value, setValue] = useState<NewReplacementData>(() => initialData(vehicle, ''));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (configs.length && !value.component_type) {
      setValue(prev => ({ ...prev, component_type: configs[0].key }));
    }
  }, [configs, value.component_type]);

  const blockedByRepair = findBlockingRepair(repairs, value.replacement_date, value.component_type);

  const handleSubmit = async () => {
    const result = buildReplacementPayload(value, blockedByRepair);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setSubmitting(true);
    try {
      await api.createReplacement(vehicle.id, result.payload);
      toast.success('Замена добавлена');
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось добавить замену');
    } finally {
      setSubmitting(false);
    }
  };

  if (!configs.length) {
    return <p className="text-body-md text-outline m-0">Загрузка компонентов...</p>;
  }

  return (
    <div className={submitting ? 'pointer-events-none opacity-70' : ''}>
      <AddReplacementForm
        configs={configs}
        today={new Date().toISOString().split('T')[0]}
        selectedVehicle={vehicle}
        value={value}
        blockedByRepair={blockedByRepair}
        onChange={(partial) => setValue(prev => ({ ...prev, ...partial }))}
        onSubmit={() => void handleSubmit()}
        onCancel={onCancel}
      />
    </div>
  );
}
