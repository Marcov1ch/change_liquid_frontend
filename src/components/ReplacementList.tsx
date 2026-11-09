import { useMemo, useState } from 'react';
import { useComponentConfigs } from '../hooks/useEnums';
import { useReplacementEditing } from '../hooks/useReplacementEditing';
import type { Repair, Replacement, Vehicle } from '../types';
import { groupReplacements } from '../utils/replacementList';
import { REPLACEMENT_TYPE_LABELS } from '../utils/replacementTypes';
import { AddReplacementForm } from './AddReplacementForm';
import { ReplacementGroup } from './ReplacementGroup';
import { VehicleCardHeader } from './VehicleCardHeader';

interface Props {
  replacements: Replacement[];
  repairs: Repair[];
  vehicleId: number | null;
  selectedVehicle: Vehicle | undefined;
  onClose: () => void;
  onShare: () => void;
  onReplacementsUpdate: () => void;
}

export function ReplacementList({
  replacements,
  repairs,
  vehicleId,
  selectedVehicle,
  onClose,
  onShare,
  onReplacementsUpdate,
}: Props) {
  const { data: configsData } = useComponentConfigs();
  const configs = useMemo(() => configsData?.configs ?? [], [configsData]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const editing = useReplacementEditing({
    repairs,
    vehicleId,
    selectedVehicle,
    configs,
    onReplacementsUpdate,
  });

  const grouped = useMemo(() => groupReplacements(replacements), [replacements]);
  const componentNames = useMemo(() => {
    const names: Record<string, string> = {};
    configs.forEach(config => {
      names[config.key] = config.name;
    });
    Object.assign(names, REPLACEMENT_TYPE_LABELS);
    return names;
  }, [configs]);

  if (!vehicleId || !selectedVehicle) return null;

  const toggleGroup = (type: string) => {
    setOpenGroups(prev => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="md3-card overflow-hidden animate-fade-in">
      <VehicleCardHeader
        vehicle={selectedVehicle}
        title={`Замены: ${selectedVehicle.brand} ${selectedVehicle.model}`}
        onClose={onClose}
        onShare={onShare}
      />

      <div className="p-4">
        {replacements.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FFF8E1] flex items-center justify-center">
              <span className="text-xl">📋</span>
            </div>
            <p className="text-title-sm text-surface-on mb-1">Нет замен</p>
            <p className="text-body-md text-outline max-w-xs">
              Чтобы начать отслеживание — добавьте первую замену. Система будет
              рассчитывать статус и напоминать о следующей замене.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {Object.entries(grouped).map(([type, items]) => (
              <ReplacementGroup
                key={type}
                type={type}
                items={items}
                componentName={componentNames[type] ?? type}
                selectedVehicle={selectedVehicle}
                isOpen={!!openGroups[type]}
                onToggle={() => toggleGroup(type)}
                onToggleNotify={() => editing.handleToggleNotify(type)}
                editingReplacementId={editing.editingReplacement?.id ?? null}
                editForm={editing.editForm}
                today={editing.today}
                repairs={repairs}
                onEditFormChange={partial => editing.setEditForm(prev => ({ ...prev, ...partial }))}
                onStartEdit={editing.startEdit}
                onCancelEdit={editing.cancelEdit}
                onSaveEdit={editing.saveEdit}
                onDelete={replacement => editing.deleteReplacement(replacement.id)}
              />
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-outline-variant">
          {!editing.showAddForm ? (
            <button
              onClick={() => editing.setShowAddForm(true)}
              className="md3-btn-primary w-full"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Добавить замену
            </button>
          ) : (
            <AddReplacementForm
              configs={configs}
              today={editing.today}
              selectedVehicle={selectedVehicle}
              value={editing.newReplacement}
              blockedByRepair={editing.addBlockingRepair}
              onChange={partial => editing.setNewReplacement(prev => ({ ...prev, ...partial }))}
              onSubmit={editing.handleAddReplacement}
              onCancel={() => editing.setShowAddForm(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
