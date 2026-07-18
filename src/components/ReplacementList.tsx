import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import type { Replacement, Vehicle, ComponentConfig } from '../types';
import { ProgressBar } from './ProgressBar';

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
  const [configs, setConfigs] = useState<ComponentConfig[]>([]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [editingReplacement, setEditingReplacement] = useState<Replacement | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReplacement, setNewReplacement] = useState({
    component_type: '',
    component_name: '',
    component_price: 0,
    work_price: 0,
    replacement_date: new Date().toISOString().split('T')[0],
    km_at_replacement: selectedVehicle?.current_km || 0,
  });
  const [editForm, setEditForm] = useState({
    km_at_replacement: '',
    replacement_date: '',
    component_name: '',
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    api.getComponentConfigs().then(data => {
      setConfigs(data.configs);
      if (data.configs.length > 0) {
        setNewReplacement(prev => prev.component_type ? prev : { ...prev, component_type: data.configs[0].key });
      }
    });
  }, []);

  useEffect(() => {
    if (selectedVehicle && configs.length > 0) {
      setNewReplacement(prev => prev.component_type ? prev : { ...prev, component_type: configs[0].key });
    }
  }, [selectedVehicle, configs]);

  if (!vehicleId || !selectedVehicle) return null;

  const liquidNames: Record<string, string> = {};
  configs.forEach(c => { liquidNames[c.key] = c.name; });

  const grouped = replacements.reduce<Record<string, Replacement[]>>((acc, replacement) => {
    const type = replacement.component_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(replacement);
    return acc;
  }, {});

  Object.keys(grouped).forEach(type => {
    grouped[type].sort((a, b) => {
      if (b.km_at_replacement !== a.km_at_replacement) return b.km_at_replacement - a.km_at_replacement;
      return new Date(b.replacement_date).getTime() - new Date(a.replacement_date).getTime();
    });
  });

  const getProgress = (type: string): number => {
    const interval = selectedVehicle.intervals[type];
    const remaining = selectedVehicle.km_remaining[type];
    if (!interval || remaining === null || remaining === undefined) return 0;
    const used = interval - remaining;
    return Math.min(100, Math.max(0, (used / interval) * 100));
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
    });
  };

  const cancelEdit = () => {
    setEditingReplacement(null);
    setEditForm({ km_at_replacement: '', replacement_date: '', component_name: '' });
  };

  const saveEdit = async () => {
    if (!editingReplacement) return;

    const updateData: Record<string, string | number> = {};
    if (editForm.component_name !== editingReplacement.component_name) updateData.component_name = editForm.component_name;
    if (parseInt(editForm.km_at_replacement) !== editingReplacement.km_at_replacement) updateData.km_at_replacement = parseInt(editForm.km_at_replacement);
    if (editForm.replacement_date !== editingReplacement.replacement_date) updateData.replacement_date = editForm.replacement_date;

    if (Object.keys(updateData).length === 0) { setEditingReplacement(null); return; }

    try {
      await api.updateReplacement(editingReplacement.id, updateData);
      setEditingReplacement(null);
      onReplacementsUpdate();
    } catch (error) {
      console.error('Ошибка при обновлении:', error);
      toast.error('Не удалось обновить замену');
    }
  };

  const deleteReplacement = async (id: number) => {
    if (!confirm('Удалить эту замену?')) return;
    try {
      await api.deleteReplacement(id);
      toast.success('Замена удалена');
      onReplacementsUpdate();
    } catch (error) {
      console.error('Ошибка при удалении:', error);
      toast.error('Не удалось удалить замену');
    }
  };

  const handleAddReplacement = async () => {
    if (!newReplacement.component_name.trim()) {
      toast.error('Введите название компонента');
      return;
    }
    try {
      await api.createReplacement(vehicleId, {
        component_type: newReplacement.component_type,
        component_name: newReplacement.component_name,
        component_price: newReplacement.component_price,
        work_price: newReplacement.work_price,
        replacement_date: newReplacement.replacement_date,
        km_at_replacement: newReplacement.km_at_replacement,
      });
      toast.success('Замена добавлена');
      setShowAddForm(false);
      setNewReplacement({
        component_type: configs[0]?.key || '',
        component_name: '',
        component_price: 0,
        work_price: 0,
        replacement_date: new Date().toISOString().split('T')[0],
        km_at_replacement: selectedVehicle.current_km,
      });
      onReplacementsUpdate();
    } catch (error) {
      console.error('Ошибка при добавлении:', error);
      toast.error('Не удалось добавить замену');
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
                    <span className="text-label-lg flex-1">{liquidNames[type] || type}</span>
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
                    <ProgressBar value={getProgress(type)} status={status} />
                  </div>

                  {isOpen && (
                    <div className="flex flex-col gap-2 p-3">
                      {grouped[type].map((r: Replacement, idx: number) => {
                        const itemStatus = r.status || 'unknown';
                        const itemStyle = statusStyles[itemStatus] || statusStyles.unknown;

                        return (
                          <div
                            key={r.id}
                            className={`p-3 rounded-md3-sm border-l-4 ${itemStyle.border} bg-surface transition-shadow duration-200 hover:shadow-md3-1`}
                          >
                            {editingReplacement?.id === r.id ? (
                              <div className="flex flex-col gap-3">
                                <input
                                  type="text"
                                  placeholder="Название"
                                  value={editForm.component_name}
                                  onChange={(e) => setEditForm({ ...editForm, component_name: e.target.value })}
                                  className="md3-field"
                                />
                                <input
                                  type="number"
                                  placeholder="Пробег"
                                  value={editForm.km_at_replacement}
                                  onChange={(e) => setEditForm({ ...editForm, km_at_replacement: e.target.value })}
                                  className="md3-field"
                                />
                                <input
                                  type="date"
                                  max={today}
                                  value={editForm.replacement_date}
                                  onChange={(e) => setEditForm({ ...editForm, replacement_date: e.target.value })}
                                  className="md3-field"
                                />
                                <div className="flex gap-2">
                                  <button onClick={saveEdit} className="md3-btn-primary !py-2 !px-4 !rounded-md3-sm text-label-sm flex-1">Сохранить</button>
                                  <button onClick={cancelEdit} className="md3-btn-text !py-2 !px-4 !rounded-md3-sm text-label-sm">Отмена</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    {idx === 0 && <span className="text-label-md">{itemStyle.icon}</span>}
                                    <span className="text-label-lg text-surface-on">{r.component_name}</span>
                                    {idx === 0 && <span className="md3-badge bg-primary-container text-primary-on-container">последняя</span>}
                                  </div>
                                  <div className="flex gap-1 shrink-0">
                                    <button
                                      onClick={() => startEdit(r)}
                                      className="flex items-center justify-center w-8 h-8 rounded-md3-full text-[#7A6100] hover:bg-[#FFF8E1] transition-colors"
                                      aria-label="Редактировать"
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => deleteReplacement(r.id)}
                                      className="flex items-center justify-center w-8 h-8 rounded-md3-full text-error hover:bg-error-container transition-colors"
                                      aria-label="Удалить"
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-outline">
                                  <span>📅 {r.replacement_date}</span>
                                  <span>📍 {r.km_at_replacement.toLocaleString()} км</span>
                                  <span>⏱ Следующая: {r.next_replacement_km?.toLocaleString()} км</span>
                                </div>
                                {r.status_message && (
                                  <p className={`mt-1 text-body-sm ${itemStyle.text}`}>{r.status_message}</p>
                                )}
                              </>
                            )}
                          </div>
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
            <div className="md3-elevated p-4">
              <h4 className="text-title-sm text-surface-on mb-4">Новая замена</h4>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-label-md text-surface-on-variant mb-1">Тип</label>
                  <select
                    value={newReplacement.component_type}
                    onChange={(e) => setNewReplacement({ ...newReplacement, component_type: e.target.value })}
                    className="md3-select"
                  >
                    {configs.map(cfg => (
                      <option key={cfg.key} value={cfg.key}>{cfg.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-label-md text-surface-on-variant mb-1">Название *</label>
                  <input
                    type="text"
                    placeholder="например: Mobil 1 5W-30"
                    value={newReplacement.component_name}
                    onChange={(e) => setNewReplacement({ ...newReplacement, component_name: e.target.value })}
                    className="md3-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-label-md text-surface-on-variant mb-1">Цена (₽)</label>
                    <input
                      type="number"
                      placeholder="5000"
                      value={newReplacement.component_price === 0 ? '' : newReplacement.component_price}
                      onChange={(e) => setNewReplacement({ ...newReplacement, component_price: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                      className="md3-field"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-surface-on-variant mb-1">Работа (₽)</label>
                    <input
                      type="number"
                      placeholder="1500"
                      value={newReplacement.work_price === 0 ? '' : newReplacement.work_price}
                      onChange={(e) => setNewReplacement({ ...newReplacement, work_price: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                      className="md3-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-label-md text-surface-on-variant mb-1">Пробег (км)</label>
                    <input
                      type="number"
                      placeholder={String(selectedVehicle?.current_km || 0)}
                      value={newReplacement.km_at_replacement === 0 ? '' : newReplacement.km_at_replacement}
                      onChange={(e) => setNewReplacement({ ...newReplacement, km_at_replacement: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                      className="md3-field"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-surface-on-variant mb-1">Дата</label>
                    <input
                      type="date"
                      max={today}
                      value={newReplacement.replacement_date}
                      onChange={(e) => setNewReplacement({ ...newReplacement, replacement_date: e.target.value })}
                      className="md3-field"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-md3-sm bg-surface-variant/50 text-body-sm text-outline">
                  💡 Поля с ценой можно оставить пустыми
                </div>

                <div className="flex gap-3 pt-1">
                  <button onClick={handleAddReplacement} className="md3-btn-primary flex-1">Сохранить</button>
                  <button onClick={() => setShowAddForm(false)} className="md3-btn-text flex-1">Отмена</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
