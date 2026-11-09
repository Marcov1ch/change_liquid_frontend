import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import type {
    ComponentConfig,
    Repair,
    Replacement,
    Vehicle,
} from '../types';
import { findBlockingRepair } from '../utils/repairConflicts';
import { isDateBasedComponent, isDateOnlyComponent } from '../utils/replacementTypes';
import type { NewReplacementData } from '../components/AddReplacementForm';
import type { ReplacementEditForm } from '../components/ReplacementItem';

const EMPTY_EDIT_FORM: ReplacementEditForm = {
    km_at_replacement: '',
    replacement_date: '',
    component_name: '',
    next_change_date: '',
    component_price: '',
    work_price: '',
};

interface Params {
    repairs: Repair[];
    vehicleId: number | null;
    selectedVehicle: Vehicle | undefined;
    configs: ComponentConfig[];
    onReplacementsUpdate: () => void;
}

function initialNewReplacement(
    configs: ComponentConfig[],
    selectedVehicle: Vehicle | undefined,
): NewReplacementData {
    return {
        component_type: configs[0]?.key ?? '',
        component_name: '',
        component_price: 0,
        work_price: 0,
        replacement_date: new Date().toISOString().split('T')[0],
        km_at_replacement: selectedVehicle?.current_km ?? 0,
        next_change_date: '',
    };
}

export function useReplacementEditing({
    repairs,
    vehicleId,
    selectedVehicle,
    configs,
    onReplacementsUpdate,
}: Params) {
    const { toast } = useToast();
    const [editingReplacement, setEditingReplacement] = useState<Replacement | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newReplacement, setNewReplacement] = useState<NewReplacementData>(() =>
        initialNewReplacement(configs, selectedVehicle),
    );
    const [editForm, setEditForm] = useState<ReplacementEditForm>(EMPTY_EDIT_FORM);

    const today = new Date().toISOString().split('T')[0];
    const addBlockingRepair = findBlockingRepair(
        repairs,
        newReplacement.replacement_date,
        newReplacement.component_type,
    );

    useEffect(() => {
        if (configs.length) {
            setNewReplacement(prev => (
                prev.component_type ? prev : { ...prev, component_type: configs[0].key }
            ));
        }
    }, [configs, selectedVehicle]);

    const startEdit = (replacement: Replacement) => {
        setEditingReplacement(replacement);
        setEditForm({
            km_at_replacement: String(replacement.km_at_replacement),
            replacement_date: replacement.replacement_date,
            component_name: replacement.component_name,
            next_change_date: replacement.next_change_date || '',
            component_price: replacement.component_price != null ? String(replacement.component_price) : '',
            work_price: replacement.work_price != null ? String(replacement.work_price) : '',
        });
    };

    const cancelEdit = () => {
        setEditingReplacement(null);
        setEditForm(EMPTY_EDIT_FORM);
    };

    const saveEdit = async () => {
        if (!editingReplacement) return;

        const isDateBased = isDateBasedComponent(editingReplacement.component_type);
        const isDateOnly = isDateOnlyComponent(editingReplacement.component_type);

        if (isDateBased && !editForm.next_change_date) {
            toast.error(isDateOnly ? 'Укажите дату окончания' : 'Укажите дату следующей замены');
            return;
        }

        const blockingRepair = findBlockingRepair(
            repairs,
            editForm.replacement_date || editingReplacement.replacement_date,
            editingReplacement.component_type,
        );

        const updateData: Record<string, string | number> = {};
        if (editForm.component_name !== editingReplacement.component_name) {
            updateData.component_name = editForm.component_name;
        }
        if (!isDateOnly && parseInt(editForm.km_at_replacement) !== editingReplacement.km_at_replacement) {
            updateData.km_at_replacement = parseInt(editForm.km_at_replacement);
        }
        if (isDateBased && editForm.next_change_date !== (editingReplacement.next_change_date || '')) {
            updateData.next_change_date = editForm.next_change_date;
        }
        const componentPrice = blockingRepair
            ? 0
            : (editForm.component_price === '' ? 0 : parseInt(editForm.component_price));
        if (componentPrice !== (editingReplacement.component_price ?? 0)) {
            updateData.component_price = componentPrice;
        }
        if (!isDateOnly) {
            const workPrice = blockingRepair
                ? 0
                : (editForm.work_price === '' ? 0 : parseInt(editForm.work_price));
            if (workPrice !== (editingReplacement.work_price ?? 0)) {
                updateData.work_price = workPrice;
            }
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
        if (!vehicleId) return;

        if (!newReplacement.component_name.trim()) {
            toast.error('Введите название компонента');
            return;
        }
        const isDateBased = isDateBasedComponent(newReplacement.component_type);
        const isDateOnly = isDateOnlyComponent(newReplacement.component_type);

        if (isDateBased && !newReplacement.next_change_date) {
            toast.error(isDateOnly ? 'Укажите дату окончания' : 'Укажите дату следующей замены');
            return;
        }

        try {
            const payload: Record<string, string | number> = {
                component_type: newReplacement.component_type,
                component_name: newReplacement.component_name,
                replacement_date: newReplacement.replacement_date,
                component_price: addBlockingRepair ? 0 : newReplacement.component_price,
            };
            if (isDateOnly) {
                payload.km_at_replacement = 0;
                payload.next_change_date = newReplacement.next_change_date;
            } else if (isDateBased) {
                payload.km_at_replacement = newReplacement.km_at_replacement;
                payload.work_price = addBlockingRepair ? 0 : newReplacement.work_price;
                payload.next_change_date = newReplacement.next_change_date;
            } else {
                payload.km_at_replacement = newReplacement.km_at_replacement;
                payload.work_price = addBlockingRepair ? 0 : newReplacement.work_price;
            }
            await api.createReplacement(vehicleId, payload);
            toast.success('Замена добавлена');
            setShowAddForm(false);
            setNewReplacement(initialNewReplacement(configs, selectedVehicle));
            onReplacementsUpdate();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Не удалось добавить замену');
        }
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

    return {
        today,
        addBlockingRepair,
        editingReplacement,
        showAddForm,
        newReplacement,
        editForm,
        startEdit,
        cancelEdit,
        saveEdit,
        deleteReplacement,
        handleAddReplacement,
        handleToggleNotify,
        setEditForm,
        setNewReplacement,
        setShowAddForm,
    };
}
