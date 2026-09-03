import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useComponentConfigs } from '../hooks/useEnums';
import type { Replacement, Vehicle } from '../types';
import { ProgressBar } from './ProgressBar';
import { AddReplacementForm, type NewReplacementData } from './AddReplacementForm';
import { ReplacementItem, type ReplacementEditForm } from './ReplacementItem';

interface Props {
  replacements: Replacement[];
  vehicleId: number | null;
  selectedVehicle: Vehicle | undefined;
  onClose: () => void;
  onReplacementsUpdate: () => void;
}

const statusStyles: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  good: { bg: 'bg-[#E6F7E6]', text: 'text-[#1B5E1B]', border: 'border-l-[#28A745]', icon: '🟢' },
  warning: { bg: 'bg-[#FFF8E1]', text: 'text-[#7A6100]', border: 'border-l-[#FFC107]', icon: '🟡' },
  critical: { bg: 'bg-[#FFF0E6]', text: 'text-[#7A2D00]', border: 'border-l-[#E06900]', icon: '🟠' },
  overdue: { bg: 'bg-error-container', text: 'text-error-on-container', border: 'border-l-error', icon: '🔴' },
  unknown: { bg: 'bg-surface-variant/50', text: 'text-surface-on-variant', border: 'border-l-outline', icon: '⚪' },
  replaced: { bg: 'bg-[#F5F5F5]', text: 'text-outline', border: 'border-l-outline-variant', icon: '📌' },
};

export function ReplacementList({ replacements, vehicleId, selectedVehicle, onClose, onReplacementsUpdate }: Props) {
  const { toast } = useToast();
  const { data: configsData } = useComponentConfigs();
  const configs = configsData?.configs ?? [];
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [editingReplacement, setEditingReplacement] = useState<Replacement | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReplacement, setNewReplacement] = useState<NewReplacementData>({
    component_type: '',
    component_name: '',
    component_price: 0,
    work_price: 0,
    replacement_date: new Date().toISOString().split('T')[0],
    km_at_replacement: selectedVehicle?.current_km || 0,
    next_change_date: '',
  });
  const [editForm, setEditForm] = useState<ReplacementEditForm>({
    km_at_replacement: '',
    replacement_date: '',
    component_name: '',
    next_change_date: '',
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (configsData?.configs.length) {
      setNewReplacement(prev => prev.component_type ? prev : { ...prev, component_type: configsData.configs[0].key });
    }
  }, [configsData, selectedVehicle]);

  if (!vehicleId || !selectedVehicle) return null;

  const componentNames: Record<string, string> = {};
  configs.forEach(c => { componentNames[c.key] = c.name; });

  const grouped = replacements.reduce<Record<string, Replacement[]>>((acc, replacement) => {
    const type = replacement.component_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(replacement);
    return acc;
  }, {});

  Object.keys(grouped).forEach(type => {
    grouped[type].sort((a, b) => {
      if (b.km_at_replacement !== a.km_at_replacement) return b.km_at_replacement - a.km_at_replacement;
      const dateDiff = new Date(b.replacement_date).getTime() - new Date(a.replacement_date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return (b.id || 0) - (a.id || 0);
    });
  });

  const getMileageUsed = (type: string): number | null => {
    if (type === 'tire_change') return null;
    const items = grouped[type];
    const latest = items?.[0];
    if (!latest) return null;
    return Math.max(0, selectedVehicle.current_km - latest.km_at_replacement);
  };

  const getProgress = (type: string): number => {
    const interval = selectedVehicle.intervals[type];
    const remaining = selectedVehicle.km_remaining[type];
    if (!interval || remaining === null || remaining === undefined) return 0;
    const used = interval - remaining;
    return Math.min(100, Math.max(0, (used / interval) * 100));
  };

  const getDateProgress = (type: string): number => {
    const items = grouped[type];
    const latest = items?.[0];
    if (!latest?.next_change_date || !latest?.replacement_date || latest.days_remaining == null) return 0;
    const start = new Date(latest.replacement_date).getTime();
    const end = new Date(latest.next_change_date).getTime();
    const totalMs = end - start;
    if (totalMs <= 0) return 100;
    const totalDays = Math.round(totalMs / 86400000);
    const elapsedDays = totalDays - latest.days_remaining;
    return Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
  };

  const toggleGroup = (type: string) => {
    setOpenGroups(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleToggleNotify = async (type: string) => {
    if (!selectedVehicle) return;
    const currentVal = selectedVehicle.notify_flags[type] ?? true;
    try {
      await api.updateNotify(selectedVehicle.id, { [type]: !currentVal });
      onReplacementsUpdate();
    } catch {
      toast.error('Не удалось изменить настройку уведомлений');
    }
  };

  const startEdit = (replacement: Replacement) => {
    setEditingReplacement(replacement);
    setEditForm({
      km_at_replacement: String(replacement.km_at_replacement),
      replacement_date: replacement.replacement_date,
      component_name: replacement.component_name,
      next_change_date: replacement.next_change_date || '',
    });
  };

  const cancelEdit = () => {
    setEditingReplacement(null);
    setEditForm({ km_at_replacement: '', replacement_date: '', component_name: '', next_change_date: '' });
  };

  const saveEdit = async () => {
    if (!editingReplacement) return;

    const updateData: Record<string, string | number> = {};
    if (editForm.component_name !== editingReplacement.component_name) updateData.component_name = editForm.component_name;
    if (editingReplacement.component_type === 'tire_change') {
      if (editForm.next_change_date !== (editingReplacement.next_change_date || '')) updateData.next_change_date = editForm.next_change_date;
    } else {
      if (parseInt(editForm.km_at_replacement) !== editingReplacement.km_at_replacement) updateData.km_at_replacement = parseInt(editForm.km_at_replacement);
    }
    if (editForm.replacement_date !== editingReplacement.replacement_date) updateData.replacement_date = editForm.replacement_date;

    if (Object.keys(updateData).length === 0) { setEditingReplacement(null); return; }

    try {
      await api.updateReplacement(editingReplacement.id, updateData);
      setEditingReplacement(null);
      onReplacementsUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось обновить замену');
    }
  };

  const deleteReplacement = async (id: number) => {
    if (!confirm('Удалить эту замену?')) return;
    try {
      await api.deleteReplacement(id);
      toast.success('Замена удалена');
      onReplacementsUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось удалить замену');
    }
  };

  const handleAddReplacement = async () => {
    if (!newReplacement.component_name.trim()) {
      toast.error('Введите название компонента');
      return;
    }
    if (newReplacement.component_type === 'tire_change' && !newReplacement.next_change_date) {
      toast.error('Укажите дату следующей замены');
      return;
    }
    try {
      const payload: Record<string, string | number> = {
        component_type: newReplacement.component_type,
        component_name: newReplacement.component_name,
        replacement_date: newReplacement.replacement_date,
      };
      if (newReplacement.component_type === 'tire_change') {
        payload.km_at_replacement = 0;
        payload.component_price = 0;
        payload.work_price = 0;
        payload.next_change_date = newReplacement.next_change_date;
      } else {
        payload.km_at_replacement = newReplacement.km_at_replacement;
        payload.component_price = newReplacement.component_price;
        payload.work_price = newReplacement.work_price;
      }
      await api.createReplacement(vehicleId, payload);
      toast.success('Замена добавлена');
      setShowAddForm(false);
      setNewReplacement({
        component_type: configs[0]?.key || '',
        component_name: '',
        component_price: 0,
        work_price: 0,
        replacement_date: new Date().toISOString().split('T')[0],
        km_at_replacement: selectedVehicle.current_km,
        next_change_date: '',
      });
      onReplacementsUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось добавить замену');
    }
  };

  return (
    <div className="md3-card overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-surface-variant/50 border-b border-outline-variant">
        <div className="flex items-center gap-3 min-w-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#44474E" strokeWidth="1.5" strokeLinecap="round" className="shrink-0">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
          </svg>
          <span className="text-title-sm text-surface-on truncate">
            Замены: {selectedVehicle.brand} {selectedVehicle.model}
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded-md3-full text-surface-on-variant hover:bg-surface-variant transition-colors shrink-0"
          aria-label="Закрыть"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        {replacements.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FFF8E1] flex items-center justify-center">
              <span className="text-xl">📋</span>
            </div>
            <p className="text-title-sm text-surface-on mb-1">Нет замен</p>
            <p className="text-body-md text-outline max-w-xs">
              Чтобы начать отслеживание — добавьте первую замену. Система будет рассчитывать статус и напоминать о следующей замене.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {Object.keys(grouped).map(type => {
              const firstReplacement = grouped[type][0];
              const status = firstReplacement.status || 'unknown';
              const sStyle = statusStyles[status] || statusStyles.unknown;
              const isOpen = openGroups[type];

              return (
                <div key={type} className="md3-card overflow-hidden">
                  <button
                    onClick={() => toggleGroup(type)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left ${sStyle.bg} ${sStyle.text} transition-colors`}
                    aria-expanded={isOpen}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
                      <polygon points="8 5 19 12 8 19 8 5" />
                    </svg>
                    <span>{sStyle.icon}</span>
                    <span className="text-label-lg flex-1">{type === 'tire_change' ? 'Шины' : (componentNames[type] || type)}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleNotify(type); }}
                      className="text-label-lg hover:opacity-70 transition-opacity"
                      aria-label={selectedVehicle.notify_flags?.[type] ? 'Отключить уведомления' : 'Включить уведомления'}
                    >
                      {selectedVehicle.notify_flags?.[type] ? '🔔' : '🔕'}
                    </button>
                    <span className="text-label-sm opacity-70">{grouped[type].length} {grouped[type].length === 1 ? 'замена' : 'замен'}</span>
                  </button>

                  <div className="px-4 pb-2">
                    <ProgressBar value={type === 'tire_change' ? getDateProgress(type) : getProgress(type)} status={status} />
                    {getMileageUsed(type) !== null && (
                      <span className="text-label-sm text-outline mt-1 block">
                        {getMileageUsed(type)!.toLocaleString()} км
                      </span>
                    )}
                  </div>

                  {isOpen && (
                    <div className="flex flex-col gap-2 p-3">
                      {grouped[type].map((r, idx) => {
                        const itemStatus = r.status || 'unknown';
                        const itemStyle = statusStyles[itemStatus] || statusStyles.unknown;

                        return (
                          <ReplacementItem
                            key={r.id}
                            replacement={r}
                            isFirst={idx === 0}
                            itemStyle={itemStyle}
                            editing={editingReplacement?.id === r.id}
                            editForm={editForm}
                            today={today}
                            onEditFormChange={(partial) => setEditForm(prev => ({ ...prev, ...partial }))}
                            onStartEdit={() => startEdit(r)}
                            onCancelEdit={cancelEdit}
                            onSaveEdit={saveEdit}
                            onDelete={() => deleteReplacement(r.id)}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-outline-variant">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
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
              today={today}
              selectedVehicle={selectedVehicle}
              value={newReplacement}
              onChange={(partial) => setNewReplacement(prev => ({ ...prev, ...partial }))}
              onSubmit={handleAddReplacement}
              onCancel={() => setShowAddForm(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
