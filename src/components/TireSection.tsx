import { useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import type { Replacement, Vehicle } from '../types';

interface Props {
  replacements: Replacement[];
  vehicleId: number | null;
  selectedVehicle: Vehicle | undefined;
  onReplacementsUpdate: () => void;
}

const statusStyles: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  good: { bg: 'bg-[#E6F7E6]', text: 'text-[#1B5E1B]', border: 'border-l-[#28A745]', icon: '🟢' },
  warning: { bg: 'bg-[#FFF8E1]', text: 'text-[#7A6100]', border: 'border-l-[#FFC107]', icon: '🟡' },
  overdue: { bg: 'bg-error-container', text: 'text-error-on-container', border: 'border-l-error', icon: '🔴' },
  unknown: { bg: 'bg-surface-variant/50', text: 'text-surface-on-variant', border: 'border-l-outline', icon: '⚪' },
  replaced: { bg: 'bg-[#F5F5F5]', text: 'text-outline', border: 'border-l-outline-variant', icon: '📌' },
};

export function TireSection({ replacements, vehicleId, selectedVehicle, onReplacementsUpdate }: Props) {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [editingReplacement, setEditingReplacement] = useState<Replacement | null>(null);
  const [editForm, setEditForm] = useState({
    replacement_date: '',
    next_change_date: '',
    component_name: '',
  });
  const [newReplacement, setNewReplacement] = useState({
    component_name: '',
    replacement_date: new Date().toISOString().split('T')[0],
    next_change_date: '',
  });

  const tireReplacements = replacements
    .filter(r => r.component_type === 'tire_change')
    .sort((a, b) => {
      if (b.km_at_replacement !== a.km_at_replacement) return b.km_at_replacement - a.km_at_replacement;
      return new Date(b.replacement_date).getTime() - new Date(a.replacement_date).getTime();
    });

  const latestTire = tireReplacements[0];
  const latestStatus = latestTire?.status || 'unknown';
  const sStyle = statusStyles[latestStatus] || statusStyles.unknown;

  const today = new Date().toISOString().split('T')[0];

  const handleToggleNotify = async () => {
    if (!selectedVehicle) return;
    const currentVal = selectedVehicle.notify_flags?.['tire_change'] ?? true;
    try {
      await api.updateNotify(selectedVehicle.id, { tire_change: !currentVal });
      onReplacementsUpdate();
    } catch {
      toast.error('Не удалось изменить настройку уведомлений');
    }
  };

  const getProgressDays = (): number => {
    if (!latestTire?.next_change_date || !latestTire?.replacement_date) return 0;
    const start = new Date(latestTire.replacement_date).getTime();
    const end = new Date(latestTire.next_change_date).getTime();
    const now = Date.now();
    const total = end - start;
    const elapsed = now - start;
    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const progressValue = getProgressDays();
  const progressClass = sStyle.border.replace('border-l-', 'bg-');

  const startEdit = (replacement: Replacement) => {
    setEditingReplacement(replacement);
    setEditForm({
      replacement_date: replacement.replacement_date,
      next_change_date: replacement.next_change_date || '',
      component_name: replacement.component_name,
    });
  };

  const cancelEdit = () => {
    setEditingReplacement(null);
    setEditForm({ replacement_date: '', next_change_date: '', component_name: '' });
  };

  const saveEdit = async () => {
    if (!editingReplacement) return;
    const updateData: Record<string, string | number> = {};
    if (editForm.component_name !== editingReplacement.component_name) updateData.component_name = editForm.component_name;
    if (editForm.replacement_date !== editingReplacement.replacement_date) updateData.replacement_date = editForm.replacement_date;
    if (editForm.next_change_date !== (editingReplacement.next_change_date || '')) updateData.next_change_date = editForm.next_change_date;

    if (Object.keys(updateData).length === 0) { setEditingReplacement(null); return; }

    try {
      await api.updateReplacement(editingReplacement.id, updateData);
      setEditingReplacement(null);
      onReplacementsUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось обновить');
    }
  };

  const deleteReplacement = async (id: number) => {
    if (!confirm('Удалить эту запись?')) return;
    try {
      await api.deleteReplacement(id);
      toast.success('Запись удалена');
      onReplacementsUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось удалить');
    }
  };

  const handleAddReplacement = async () => {
    if (!newReplacement.component_name.trim()) {
      toast.error('Введите название');
      return;
    }
    if (!newReplacement.next_change_date) {
      toast.error('Укажите дату следующей замены');
      return;
    }
    try {
      await api.createReplacement(vehicleId!, {
        component_type: 'tire_change',
        component_name: newReplacement.component_name,
        component_price: 0,
        work_price: 0,
        replacement_date: newReplacement.replacement_date,
        km_at_replacement: 0,
        next_change_date: newReplacement.next_change_date,
      });
      toast.success('Замена шин добавлена');
      setShowAddForm(false);
      setNewReplacement({
        component_name: '',
        replacement_date: new Date().toISOString().split('T')[0],
        next_change_date: '',
      });
      onReplacementsUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось добавить');
    }
  };

  if (!vehicleId || !selectedVehicle) return null;

  return (
    <div className="md3-card overflow-hidden animate-fade-in">
      <div className={`flex items-center justify-between gap-3 px-4 py-3 ${sStyle.bg} ${sStyle.text} border-b border-outline-variant`}>
        <div className="flex items-center gap-3 min-w-0">
          <span>{sStyle.icon}</span>
          <span className="text-title-sm truncate">Замена шин</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggleNotify}
            className="text-label-lg hover:opacity-70 transition-opacity"
            aria-label={selectedVehicle.notify_flags?.['tire_change'] ? 'Отключить уведомления' : 'Включить уведомления'}
          >
            {selectedVehicle.notify_flags?.['tire_change'] ? '🔔' : '🔕'}
          </button>
          <span className="text-label-sm opacity-70">{tireReplacements.length} {tireReplacements.length === 1 ? 'запись' : 'записей'}</span>
        </div>
      </div>

      <div className="p-4">
        {tireReplacements.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#E3F2FD] flex items-center justify-center">
              <span className="text-xl">🛞</span>
            </div>
            <p className="text-title-sm text-surface-on mb-1">Нет записей о шинах</p>
            <p className="text-body-md text-outline max-w-xs">
              Добавьте запись о сезонной замене шин, указав дату следующей обязательной замены.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Group header */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left ${sStyle.bg} ${sStyle.text} rounded-md3-sm transition-colors`}
              aria-expanded={isOpen}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
                <polygon points="8 5 19 12 8 19 8 5" />
              </svg>
              <span>{sStyle.icon}</span>
              <span className="text-label-lg flex-1">{latestTire.component_name}</span>
              <span className={`md3-badge ${sStyle.bg} ${sStyle.text}`}>
                {latestTire.days_remaining != null
                  ? latestTire.days_remaining <= 5
                    ? `⚠️ ${latestTire.days_remaining} дн.`
                    : `${latestTire.days_remaining} дн.`
                  : '—'}
              </span>
            </button>

            {/* Progress bar */}
            <div className="px-4">
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 rounded-full bg-outline-variant/50" style={{ height: '6px' }}>
                  <div
                    className={`rounded-full transition-all duration-500 ease-out ${progressClass}`}
                    style={{ width: `${Math.min(100, Math.max(0, progressValue))}%`, height: '100%' }}
                  />
                </div>
                <span className={`text-label-sm tabular-nums shrink-0 ${sStyle.text}`}>
                  {Math.round(progressValue)}%
                </span>
              </div>
            </div>

            {/* History list */}
            {isOpen && (
              <div className="flex flex-col gap-2 p-3">
                {tireReplacements.map((r, idx) => {
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
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-label-md text-surface-on-variant mb-1">Дата замены</label>
                              <input
                                type="date"
                                max={today}
                                value={editForm.replacement_date}
                                onChange={(e) => setEditForm({ ...editForm, replacement_date: e.target.value })}
                                className="md3-field"
                              />
                            </div>
                            <div>
                              <label className="block text-label-md text-surface-on-variant mb-1">След. замена</label>
                              <input
                                type="date"
                                value={editForm.next_change_date}
                                onChange={(e) => setEditForm({ ...editForm, next_change_date: e.target.value })}
                                className="md3-field"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={saveEdit} className="md3-btn-primary !py-2 !px-4 !rounded-md3-sm text-label-sm flex-1">Сохранить</button>
                            <button onClick={cancelEdit} className="md3-btn-text !py-2 !px-4 !rounded-md3-sm text-label-sm">Отмена</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 min-w-0">
                            {idx === 0 && <span className="text-label-md">{itemStyle.icon}</span>}
                            <span className="text-label-lg text-surface-on">{r.component_name}</span>
                            {idx === 0 && <span className="md3-badge bg-primary-container text-primary-on-container">последняя</span>}
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-outline">
                              <span>📅 {r.replacement_date}</span>
                              {r.next_change_date && <span>⏱ До: {r.next_change_date}</span>}
                              {r.days_remaining != null && (
                                <span className={r.days_remaining <= 5 ? 'text-error font-semibold' : ''}>
                                  ⏳ {r.days_remaining} дн.
                                </span>
                              )}
                            </div>
                            <div className="flex gap-0">
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
              Добавить замену шин
            </button>
          ) : (
            <div className="md3-elevated p-4">
              <h4 className="text-title-sm text-surface-on mb-4">Новая запись о шинах</h4>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-label-md text-surface-on-variant mb-1">Название</label>
                  <input
                    type="text"
                    placeholder="например: Зимняя резина Michelin / Договор хранения №123"
                    value={newReplacement.component_name}
                    onChange={(e) => setNewReplacement({ ...newReplacement, component_name: e.target.value })}
                    className="md3-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-label-md text-surface-on-variant mb-1">Дата замены</label>
                    <input
                      type="date"
                      max={today}
                      value={newReplacement.replacement_date}
                      onChange={(e) => setNewReplacement({ ...newReplacement, replacement_date: e.target.value })}
                      className="md3-field"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-surface-on-variant mb-1">Дата след. замены *</label>
                    <input
                      type="date"
                      value={newReplacement.next_change_date}
                      onChange={(e) => setNewReplacement({ ...newReplacement, next_change_date: e.target.value })}
                      className="md3-field"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-md3-sm bg-[#E3F2FD] text-body-sm text-outline">
                  💡 Укажите дату окончания хранения шин — за 5 дней до неё придёт уведомление.
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
