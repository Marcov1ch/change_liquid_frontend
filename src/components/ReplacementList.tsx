import { useState } from 'react';
import { api } from '../api/client';
import type { Replacement, Vehicle } from '../types';

interface Props {
    replacements: Replacement[];
    vehicleId: number | null;
    selectedVehicle: Vehicle | undefined;
    onClose: () => void;
    onReplacementsUpdate: () => void;
}

const liquidNames: Record<string, string> = {
    'engine_oil': 'Моторное масло',
    'transmission_oil': 'Масло АКПП',
    'brake_fluid': 'Тормозная жидкость',
    'coolant': 'Антифриз',
    'power_steering_fluid': 'Жидкость ГУР',
    'differential_oil': 'Масло в редукторе'
};

const statusStyles: Record<string, { bg: string; text: string; border: string; icon: string }> = {
    good: { bg: 'bg-md-status-good', text: 'text-md-status-good-text', border: 'border-md-status-good-text', icon: '🟢' },
    warning: { bg: 'bg-md-status-warning', text: 'text-md-status-warning-text', border: 'border-md-status-warning-text', icon: '🟡' },
    critical: { bg: 'bg-md-status-critical', text: 'text-md-status-critical-text', border: 'border-md-status-critical-text', icon: '🟠' },
    overdue: { bg: 'bg-md-status-overdue', text: 'text-md-status-overdue-text', border: 'border-md-status-overdue-text', icon: '🔴' },
    unknown: { bg: 'bg-md-status-unknown', text: 'text-md-status-unknown-text', border: 'border-md-status-unknown-text', icon: '⚪' },
    replaced: { bg: 'bg-md-status-replaced', text: 'text-md-status-replaced-text', border: 'border-md-status-replaced-text', icon: '📌' }
};

const liquidTypesList = [
    { value: 'engine_oil', label: 'Моторное масло' },
    { value: 'transmission_oil', label: 'Масло АКПП' },
    { value: 'brake_fluid', label: 'Тормозная жидкость' },
    { value: 'coolant', label: 'Антифриз' },
    { value: 'power_steering_fluid', label: 'Жидкость ГУР' },
    { value: 'differential_oil', label: 'Масло в редукторе' }
];

const liquidNotifyMap: Record<string, string> = {
    'engine_oil': 'oil_notify_enabled',
    'transmission_oil': 'transmission_notify_enabled',
    'brake_fluid': 'brake_notify_enabled',
    'coolant': 'coolant_notify_enabled',
    'power_steering_fluid': 'power_steering_notify_enabled',
    'differential_oil': 'differential_oil_notify_enabled'
};

export function ReplacementList({ replacements, vehicleId, selectedVehicle, onClose, onReplacementsUpdate }: Props) {
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    const [editingReplacement, setEditingReplacement] = useState<Replacement | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newReplacement, setNewReplacement] = useState({
        liquid_type: 'engine_oil',
        liquid_name: '',
        liquid_price: 0,
        work_price: 0,
        replacement_date: new Date().toISOString().split('T')[0],
        km_at_replacement: 0
    });
    const [editForm, setEditForm] = useState({
        km_at_replacement: '',
        replacement_date: '',
        liquid_name: ''
    });
    const [submitting, setSubmitting] = useState(false);

    if (!vehicleId || !selectedVehicle) return null;

    const grouped = replacements.reduce<Record<string, Replacement[]>>((acc, replacement) => {
        const type = replacement.liquid_type;
        if (!acc[type]) acc[type] = [];
        acc[type].push(replacement);
        return acc;
    }, {});

    Object.keys(grouped).forEach(type => {
        grouped[type].sort((a, b) => {
            if (b.km_at_replacement !== a.km_at_replacement) {
                return b.km_at_replacement - a.km_at_replacement;
            }
            return new Date(b.replacement_date).getTime() - new Date(a.replacement_date).getTime();
        });
    });

    const toggleGroup = (type: string) => {
        setOpenGroups(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const handleToggleNotify = async (type: string) => {
        const field = liquidNotifyMap[type];
        if (!field || !selectedVehicle) return;
        const newValue = !(selectedVehicle as unknown as Record<string, boolean>)[field];
        try {
            await api.updateNotify(selectedVehicle.id, { [field]: newValue });
            onReplacementsUpdate();
        } catch {
            alert('Не удалось изменить настройку уведомлений');
        }
    };

    const startEdit = (replacement: Replacement) => {
        setEditingReplacement(replacement);
        setEditForm({
            km_at_replacement: String(replacement.km_at_replacement),
            replacement_date: replacement.replacement_date,
            liquid_name: replacement.liquid_name
        });
    };

    const cancelEdit = () => {
        setEditingReplacement(null);
        setEditForm({ km_at_replacement: '', replacement_date: '', liquid_name: '' });
    };

    const saveEdit = async () => {
        if (!editingReplacement) return;

        const updateData: Record<string, string | number> = {};
        if (editForm.liquid_name !== editingReplacement.liquid_name) updateData.liquid_name = editForm.liquid_name;
        if (parseInt(editForm.km_at_replacement) !== editingReplacement.km_at_replacement) updateData.km_at_replacement = parseInt(editForm.km_at_replacement);
        if (editForm.replacement_date !== editingReplacement.replacement_date) updateData.replacement_date = editForm.replacement_date;

        if (Object.keys(updateData).length === 0) {
            setEditingReplacement(null);
            return;
        }

        setSubmitting(true);
        try {
            await api.updateReplacement(editingReplacement.id, updateData);
            setEditingReplacement(null);
            onReplacementsUpdate();
        } catch (error) {
            console.error('Ошибка при обновлении:', error);
            alert('Не удалось обновить замену');
        } finally {
            setSubmitting(false);
        }
    };

    const deleteReplacement = async (id: number) => {
        if (!confirm('Удалить эту замену?')) return;
        try {
            await api.deleteReplacement(id);
            onReplacementsUpdate();
        } catch (error) {
            console.error('Ошибка при удалении:', error);
            alert('Не удалось удалить замену');
        }
    };

    const handleAddReplacement = async () => {
        if (!newReplacement.liquid_name.trim()) {
            alert('Введите название жидкости');
            return;
        }

        setSubmitting(true);
        try {
            await api.createReplacement(vehicleId, {
                liquid_type: newReplacement.liquid_type,
                liquid_name: newReplacement.liquid_name,
                liquid_price: newReplacement.liquid_price,
                work_price: newReplacement.work_price,
                replacement_date: newReplacement.replacement_date,
                km_at_replacement: newReplacement.km_at_replacement
            });

            setShowAddForm(false);
            setNewReplacement({
                liquid_type: 'engine_oil',
                liquid_name: '',
                liquid_price: 0,
                work_price: 0,
                replacement_date: new Date().toISOString().split('T')[0],
                km_at_replacement: selectedVehicle.current_km
            });
            onReplacementsUpdate();
        } catch (error) {
            console.error('Ошибка при добавлении:', error);
            alert('Не удалось добавить замену');
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass = "w-full px-3 py-2 text-body-large rounded-md-sm border border-md-outline bg-md-surface text-md-on-surface transition-all duration-md-2 focus:outline-none focus:ring-2 focus:ring-md-primary focus:border-md-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
    const selectClass = "w-full px-3 py-2 text-body-large rounded-md-sm border border-md-outline bg-md-surface text-md-on-surface transition-all duration-md-2 focus:outline-none focus:ring-2 focus:ring-md-primary focus:border-md-primary";

    return (
        <div className="mt-4 bg-md-surface rounded-md-md border border-md-outline-variant shadow-md-1 overflow-hidden">
            <div className="px-4 py-3 bg-md-surface-variant flex items-center justify-between gap-2">
                <span className="text-title-small text-md-on-surface-variant">
                    Замены жидкостей для: {selectedVehicle.brand} {selectedVehicle.model}
                </span>
                <button
                    onClick={onClose}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md-full
                               text-body-medium text-md-on-surface-variant
                               transition-all duration-md-2 hover:bg-md-surface active:scale-90"
                    aria-label="Закрыть"
                >
                    ✕
                </button>
            </div>

            <div className="p-4">
                {replacements.length === 0 ? (
                    <div className="mb-4 p-4 bg-md-status-warning rounded-md-sm border border-md-status-warning-text/30">
                        <p className="text-body-medium font-medium text-md-status-warning-text mb-1">Нет замен</p>
                        <p className="text-body-small text-md-status-warning-text">
                            Чтобы начать отслеживание — добавьте первую замену.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {Object.keys(grouped).map(type => {
                            const firstReplacement = grouped[type][0];
                            const status = firstReplacement.status || 'unknown';
                            const ss = statusStyles[status] || statusStyles.unknown;
                            const isOpen = openGroups[type];
                            const isNotifyOn = (selectedVehicle as unknown as Record<string, boolean>)?.[liquidNotifyMap[type]];

                            return (
                                <div key={type} className="rounded-md-sm border border-md-outline-variant overflow-hidden">
                                    <button
                                        onClick={() => toggleGroup(type)}
                                        className={`w-full px-3 py-2.5 flex items-center gap-2.5 text-left
                                                    transition-all duration-md-2 ${ss.bg} ${ss.text}
                                                    hover:brightness-95`}
                                    >
                                        <span className="text-xs w-4 text-center transition-transform duration-md-2"
                                              style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                                            ▶
                                        </span>
                                        <span>{ss.icon}</span>
                                        <span className="text-label-large flex-1">{liquidNames[type] || type}</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleToggleNotify(type); }}
                                            className="text-body-medium transition-all duration-md-2 hover:scale-110"
                                            title="Вкл/Выкл уведомления"
                                        >
                                            {isNotifyOn ? '🔔' : '🔕'}
                                        </button>
                                        <span className="text-label-small opacity-70">
                                            {grouped[type].length} {grouped[type].length === 1 ? 'замена' : 'замен'}
                                        </span>
                                    </button>

                                    {isOpen && (
                                        <div className="p-2 space-y-2">
                                            {grouped[type].map((r: Replacement, idx: number) => {
                                                const itemStatus = r.status || 'unknown';
                                                const iss = statusStyles[itemStatus] || statusStyles.unknown;
                                                const isLatest = idx === 0;

                                                return (
                                                    <div
                                                        key={r.id}
                                                        className={`rounded-md-sm bg-md-surface border transition-all duration-md-2
                                                                    ${isLatest ? `border-l-4 ${iss.border}` : 'border-md-outline-variant'}`}
                                                    >
                                                        {editingReplacement?.id === r.id ? (
                                                            <div className="p-3 space-y-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Название"
                                                                    value={editForm.liquid_name}
                                                                    onChange={(e) => setEditForm({ ...editForm, liquid_name: e.target.value })}
                                                                    className={inputClass}
                                                                />
                                                                <input
                                                                    type="number"
                                                                    placeholder="Пробег"
                                                                    value={editForm.km_at_replacement}
                                                                    onChange={(e) => setEditForm({ ...editForm, km_at_replacement: e.target.value })}
                                                                    className={inputClass}
                                                                />
                                                                <input
                                                                    type="date"
                                                                    value={editForm.replacement_date}
                                                                    onChange={(e) => setEditForm({ ...editForm, replacement_date: e.target.value })}
                                                                    className={inputClass}
                                                                />
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={saveEdit}
                                                                        disabled={submitting}
                                                                        className="flex-1 py-2 px-3 rounded-md-full text-label-large
                                                                                   bg-md-status-good-text text-white
                                                                                   transition-all duration-md-2 hover:shadow-md-1
                                                                                   active:scale-[0.98] disabled:opacity-50"
                                                                    >
                                                                        Сохранить
                                                                    </button>
                                                                    <button
                                                                        onClick={cancelEdit}
                                                                        className="flex-1 py-2 px-3 rounded-md-full text-label-large
                                                                                   bg-md-surface-variant text-md-on-surface-variant
                                                                                   transition-all duration-md-2 hover:shadow-md-1
                                                                                   active:scale-[0.98]"
                                                                    >
                                                                        Отмена
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="p-3">
                                                                <div className="flex justify-between items-start gap-2">
                                                                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                                        {isLatest && <span>{iss.icon}</span>}
                                                                        <span className="text-body-medium font-medium text-md-on-surface truncate">
                                                                            {r.liquid_name}
                                                                        </span>
                                                                        {isLatest && (
                                                                            <span className={`text-label-small ${iss.text} flex-shrink-0`}>
                                                                                последняя
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex gap-1 flex-shrink-0">
                                                                        <button
                                                                            onClick={() => startEdit(r)}
                                                                            className="inline-flex items-center justify-center w-7 h-7 rounded-md-full
                                                                                       text-body-small bg-yellow-100 text-yellow-800
                                                                                       transition-all duration-md-2 hover:shadow-md-1 active:scale-90"
                                                                            title="Редактировать"
                                                                        >
                                                                            ✏️
                                                                        </button>
                                                                        <button
                                                                            onClick={() => deleteReplacement(r.id)}
                                                                            className="inline-flex items-center justify-center w-7 h-7 rounded-md-full
                                                                                       text-body-small bg-md-error-container text-md-on-error-container
                                                                                       transition-all duration-md-2 hover:shadow-md-1 active:scale-90"
                                                                            title="Удалить"
                                                                        >
                                                                            🗑️
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-1.5 space-y-0.5">
                                                                    <p className="text-body-small text-md-on-surface-variant">
                                                                        📅 {r.replacement_date}
                                                                    </p>
                                                                    <p className="text-body-small text-md-on-surface-variant">
                                                                        📍 {r.km_at_replacement} км | ⏱ Следующая: {r.next_replacement_km} км
                                                                    </p>
                                                                    {r.status_message && (
                                                                        <p className={`text-body-small ${iss.text} mt-1`}>
                                                                            {r.status_message}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
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

                <div className="mt-4 pt-4 border-t border-md-outline-variant">
                    {!showAddForm ? (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="w-full py-2.5 px-4 rounded-md-full text-label-large
                                       bg-md-primary-container text-md-on-primary-container
                                       transition-all duration-md-2 hover:shadow-md-1
                                       active:scale-[0.98]"
                        >
                            + Добавить замену
                        </button>
                    ) : (
                        <div className="bg-md-surface rounded-md-sm border border-md-outline-variant p-4 space-y-3">
                            <h4 className="text-title-small text-md-on-surface">Новая замена</h4>

                            <div>
                                <label className="block text-label-medium mb-1 text-md-on-surface-variant">Тип жидкости</label>
                                <select
                                    value={newReplacement.liquid_type}
                                    onChange={(e) => setNewReplacement({ ...newReplacement, liquid_type: e.target.value })}
                                    className={selectClass}
                                >
                                    {liquidTypesList.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-label-medium mb-1 text-md-on-surface-variant">Название жидкости *</label>
                                <input
                                    type="text"
                                    placeholder="например: Mobil 1 5W-30"
                                    value={newReplacement.liquid_name}
                                    onChange={(e) => setNewReplacement({ ...newReplacement, liquid_name: e.target.value })}
                                    className={inputClass}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-label-medium mb-1 text-md-on-surface-variant">Цена жидкости (₽)</label>
                                    <input
                                        type="number"
                                        placeholder="5000"
                                        value={newReplacement.liquid_price === 0 ? '' : newReplacement.liquid_price}
                                        onChange={(e) => setNewReplacement({ ...newReplacement, liquid_price: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="block text-label-medium mb-1 text-md-on-surface-variant">Стоимость работы (₽)</label>
                                    <input
                                        type="number"
                                        placeholder="1500"
                                        value={newReplacement.work_price === 0 ? '' : newReplacement.work_price}
                                        onChange={(e) => setNewReplacement({ ...newReplacement, work_price: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-label-medium mb-1 text-md-on-surface-variant">Пробег при замене (км)</label>
                                    <input
                                        type="number"
                                        placeholder={String(selectedVehicle?.current_km || 0)}
                                        value={newReplacement.km_at_replacement === 0 ? '' : newReplacement.km_at_replacement}
                                        onChange={(e) => setNewReplacement({ ...newReplacement, km_at_replacement: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="block text-label-medium mb-1 text-md-on-surface-variant">Дата замены</label>
                                    <input
                                        type="date"
                                        value={newReplacement.replacement_date}
                                        onChange={(e) => setNewReplacement({ ...newReplacement, replacement_date: e.target.value })}
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <p className="text-body-small text-md-on-surface-variant bg-md-surface-variant px-3 py-2 rounded-md-sm">
                                💡 Поля с ценой можно оставить пустыми
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleAddReplacement}
                                    disabled={submitting}
                                    className="flex-1 py-2 px-3 rounded-md-full text-label-large
                                               bg-md-primary text-md-on-primary
                                               transition-all duration-md-2 hover:shadow-md-1
                                               active:scale-[0.98] disabled:opacity-50
                                               flex items-center justify-center gap-2"
                                >
                                    {submitting && (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white
                                                         rounded-md-full animate-spin" />
                                    )}
                                    Сохранить
                                </button>
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="flex-1 py-2 px-3 rounded-md-full text-label-large
                                               bg-md-surface-variant text-md-on-surface-variant
                                               transition-all duration-md-2 hover:shadow-md-1
                                               active:scale-[0.98]"
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
