import { useState } from 'react';
import { api } from '../api/client';

interface Props {
    replacements: any[];
    vehicleId: number | null;
    selectedVehicle: any;
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

const statusStyles: Record<string, { backgroundColor: string; color: string; borderColor: string; icon: string }> = {
    good: { backgroundColor: '#d4edda', color: '#155724', borderColor: '#28a745', icon: '🟢' },
    warning: { backgroundColor: '#fff3cd', color: '#856404', borderColor: '#ffc107', icon: '🟡' },
    critical: { backgroundColor: '#f8d7da', color: '#721c24', borderColor: '#fd7e14', icon: '🟠' },
    overdue: { backgroundColor: '#f8d7da', color: '#721c24', borderColor: '#dc3545', icon: '🔴' },
    unknown: { backgroundColor: '#e9ecef', color: '#6c757d', borderColor: '#ced4da', icon: '⚪' }
};

const liquidTypesList = [
    { value: 'engine_oil', label: 'Моторное масло' },
    { value: 'transmission_oil', label: 'Масло АКПП' },
    { value: 'brake_fluid', label: 'Тормозная жидкость' },
    { value: 'coolant', label: 'Антифриз' },
    { value: 'power_steering_fluid', label: 'Жидкость ГУР' },
    { value: 'differential_oil', label: 'Масло в редукторе' }
];

export function ReplacementList({ replacements, vehicleId, selectedVehicle, onClose, onReplacementsUpdate }: Props) {
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    const [editingReplacement, setEditingReplacement] = useState<any>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newReplacement, setNewReplacement] = useState({
        liquid_type: 'engine_oil',
        liquid_name: '',
        liquid_price: 0,
        work_price: 0,
        replacement_date: new Date().toISOString().split('T')[0],
        km_at_replacement: selectedVehicle?.current_km || 0
    });
    const [editForm, setEditForm] = useState({
        km_at_replacement: '',
        replacement_date: '',
        liquid_name: ''
    });

    if (!vehicleId || !selectedVehicle) return null;

    // Группируем замены по типу жидкости
    const grouped = replacements.reduce((acc: any, replacement) => {
        const type = replacement.liquid_type;
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(replacement);
        return acc;
    }, {});

    // Сортируем замены в каждой группе от новых к старым (по пробегу)
    Object.keys(grouped).forEach(type => {
        grouped[type].sort((a: any, b: any) => {
            if (b.km_at_replacement !== a.km_at_replacement) {
                return b.km_at_replacement - a.km_at_replacement;
            }
            return new Date(b.replacement_date).getTime() - new Date(a.replacement_date).getTime();
        });
    });

    const toggleGroup = (type: string) => {
        setOpenGroups(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const startEdit = (replacement: any) => {
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

        const updateData: any = {};

        if (editForm.liquid_name !== editingReplacement.liquid_name) {
            updateData.liquid_name = editForm.liquid_name;
        }

        if (parseInt(editForm.km_at_replacement) !== editingReplacement.km_at_replacement) {
            updateData.km_at_replacement = parseInt(editForm.km_at_replacement);
        }

        if (editForm.replacement_date !== editingReplacement.replacement_date) {
            updateData.replacement_date = editForm.replacement_date;
        }

        if (Object.keys(updateData).length === 0) {
            setEditingReplacement(null);
            return;
        }

        try {
            await api.updateReplacement(editingReplacement.id, updateData);
            setEditingReplacement(null);
            onReplacementsUpdate();
        } catch (error) {
            console.error('Ошибка при обновлении:', error);
            alert('Не удалось обновить замену');
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
        }
    };

    return (
        <div style={{
            marginTop: '10px',
            backgroundColor: '#f5f5f5',
            borderRadius: '5px',
            border: '1px solid #ddd',
            overflow: 'hidden'
        }}>
            {/* Заголовок с информацией об авто и кнопкой закрытия */}
            <div style={{
                padding: '10px',
                backgroundColor: '#e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
            }}>
                <span style={{ fontWeight: 'bold' }}>
                    Замены жидкостей для: {selectedVehicle.brand} {selectedVehicle.model}
                </span>
                <button
                    onClick={onClose}
                    style={{ padding: '2px 8px', cursor: 'pointer' }}
                >
                    ✕
                </button>
            </div>

            {/* Замены жидкостей */}
            <div style={{ padding: '10px' }}>
                {replacements.length === 0 ? (
                    <p style={{ margin: '0 0 15px 0', color: '#666' }}>Нет замен</p>
                ) : (
                    <div>
                        {Object.keys(grouped).map(type => {
                            // Берём статус первой замены в группе (самой новой)
                            const firstReplacement = grouped[type][0];
                            const status = firstReplacement.status || 'unknown';
                            const statusStyle = statusStyles[status] || statusStyles.unknown;

                            return (
                                <div key={type} style={{ marginBottom: '15px' }}>
                                    <div
                                        onClick={() => toggleGroup(type)}
                                        style={{
                                            padding: '8px 10px',
                                            backgroundColor: statusStyle.backgroundColor,
                                            color: statusStyle.color,
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            border: `1px solid ${statusStyle.borderColor}`
                                        }}
                                    >
                                        <span>{openGroups[type] ? '▼' : '▶'}</span>
                                        <span>{statusStyle.icon}</span>
                                        <span>{liquidNames[type] || type}</span>
                                        <span style={{ fontSize: '12px', marginLeft: 'auto' }}>
                                            {grouped[type].length} замен
                                        </span>
                                    </div>

                                    {openGroups[type] && (
                                        <ul style={{ listStyle: 'none', padding: '0 0 0 10px', margin: '10px 0 0 0' }}>
                                            {grouped[type].map((r: any, idx: number) => {
                                                const itemStatus = r.status || 'unknown';
                                                const itemStatusStyle = statusStyles[itemStatus] || statusStyles.unknown;

                                                return (
                                                    <li key={r.id} style={{
                                                        marginBottom: '8px',
                                                        padding: '10px',
                                                        backgroundColor: 'white',
                                                        borderRadius: '5px',
                                                        border: '1px solid #eee',
                                                        borderLeft: idx === 0 ? `3px solid ${itemStatusStyle.borderColor}` : '1px solid #eee'
                                                    }}>
                                                        {editingReplacement?.id === r.id ? (
                                                            <div>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Название"
                                                                    value={editForm.liquid_name}
                                                                    onChange={(e) => setEditForm({ ...editForm, liquid_name: e.target.value })}
                                                                    style={{ width: '100%', marginBottom: '8px', padding: '5px', boxSizing: 'border-box' }}
                                                                />
                                                                <input
                                                                    type="number"
                                                                    placeholder="Пробег"
                                                                    value={editForm.km_at_replacement}
                                                                    onChange={(e) => setEditForm({ ...editForm, km_at_replacement: e.target.value })}
                                                                    style={{ width: '100%', marginBottom: '8px', padding: '5px', boxSizing: 'border-box' }}
                                                                />
                                                                <input
                                                                    type="date"
                                                                    value={editForm.replacement_date}
                                                                    onChange={(e) => setEditForm({ ...editForm, replacement_date: e.target.value })}
                                                                    style={{ width: '100%', marginBottom: '8px', padding: '5px', boxSizing: 'border-box' }}
                                                                />
                                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                                    <button onClick={saveEdit} style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px' }}>Сохранить</button>
                                                                    <button onClick={cancelEdit} style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '3px' }}>Отмена</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <div>
                                                                        {idx === 0 && (
                                                                            <span style={{ color: itemStatusStyle.borderColor, marginRight: '8px' }}>
                                                                                {itemStatusStyle.icon}
                                                                            </span>
                                                                        )}
                                                                        <strong>{r.liquid_name}</strong>
                                                                        {idx === 0 && (
                                                                            <span style={{ fontSize: '11px', color: itemStatusStyle.borderColor, marginLeft: '8px' }}>
                                                                                последняя
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <button
                                                                            onClick={() => startEdit(r)}
                                                                            style={{
                                                                                fontSize: '12px',
                                                                                padding: '2px 6px',
                                                                                marginRight: '5px',
                                                                                cursor: 'pointer',
                                                                                backgroundColor: '#ffc107',
                                                                                border: 'none',
                                                                                borderRadius: '3px'
                                                                            }}
                                                                        >
                                                                            ✏️
                                                                        </button>
                                                                        <button
                                                                            onClick={() => deleteReplacement(r.id)}
                                                                            style={{
                                                                                fontSize: '12px',
                                                                                padding: '2px 6px',
                                                                                cursor: 'pointer',
                                                                                backgroundColor: '#dc3545',
                                                                                color: 'white',
                                                                                border: 'none',
                                                                                borderRadius: '3px'
                                                                            }}
                                                                        >
                                                                            🗑️
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px', textAlign: 'left' }}>
                                                                    📅 {r.replacement_date}
                                                                </div>
                                                                <div style={{ fontSize: '12px', color: '#666', textAlign: 'left' }}>
                                                                    📍 {r.km_at_replacement} км | ⏱ Следующая замена: {r.next_replacement_km} км
                                                                </div>
                                                                    <div style={{ fontSize: '11px', marginTop: '5px', color: itemStatusStyle.color, textAlign: 'left' }}>
                                                                    {r.status_message}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Кнопка добавления замены */}
                <div style={{ marginTop: '15px', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
                    {!showAddForm ? (
                        <button
                            onClick={() => setShowAddForm(true)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            + Добавить замену
                        </button>
                    ) : (
                        <div style={{
                            backgroundColor: 'white',
                            padding: '15px',
                            borderRadius: '5px',
                            border: '1px solid #ddd',
                            maxWidth: '100%',
                            overflowX: 'auto'
                        }}>
                            <h4 style={{ margin: '0 0 10px 0' }}>Новая замена</h4>

                            <div style={{ marginBottom: '8px' }}>
                                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Тип жидкости</label>
                                <select
                                    value={newReplacement.liquid_type}
                                    onChange={(e) => setNewReplacement({ ...newReplacement, liquid_type: e.target.value })}
                                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                >
                                    {liquidTypesList.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '8px' }}>
                                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Название жидкости *</label>
                                <input
                                    type="text"
                                    placeholder="например: Mobil 1 5W-30"
                                    value={newReplacement.liquid_name}
                                    onChange={(e) => setNewReplacement({ ...newReplacement, liquid_name: e.target.value })}
                                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ marginBottom: '8px' }}>
                                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Цена жидкости (₽)</label>
                                <input
                                    type="number"
                                    placeholder="5000"
                                    value={newReplacement.liquid_price === 0 ? '' : newReplacement.liquid_price}
                                    onChange={(e) => setNewReplacement({ ...newReplacement, liquid_price: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ marginBottom: '8px' }}>
                                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Стоимость работы (₽)</label>
                                <input
                                    type="number"
                                    placeholder="1500"
                                    value={newReplacement.work_price === 0 ? '' : newReplacement.work_price}
                                    onChange={(e) => setNewReplacement({ ...newReplacement, work_price: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ marginBottom: '8px' }}>
                                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Пробег при замене (км)</label>
                                <input
                                    type="number"
                                    placeholder={String(selectedVehicle?.current_km || 0)}
                                    value={newReplacement.km_at_replacement === 0 ? '' : newReplacement.km_at_replacement}
                                    onChange={(e) => setNewReplacement({ ...newReplacement, km_at_replacement: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ marginBottom: '8px' }}>
                                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Дата замены</label>
                                <input
                                    type="date"
                                    value={newReplacement.replacement_date}
                                    onChange={(e) => setNewReplacement({ ...newReplacement, replacement_date: e.target.value })}
                                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '15px', padding: '8px', backgroundColor: '#f0f0f0', borderRadius: '3px' }}>
                                💡 Поля с ценой можно оставить пустыми
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={handleAddReplacement}
                                    style={{
                                        flex: 1,
                                        padding: '8px',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '3px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Сохранить
                                </button>
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    style={{
                                        flex: 1,
                                        padding: '8px',
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '3px',
                                        cursor: 'pointer'
                                    }}
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