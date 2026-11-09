import type { Repair, Replacement, Vehicle } from '../types';
import { isDateBasedComponent, isDateOnlyComponent } from '../utils/replacementTypes';
import { getDateProgress, getKmProgress } from '../utils/replacementList';
import { findBlockingRepair } from '../utils/repairConflicts';
import { getReplacementStatusStyle } from '../utils/statusStyles';
import { ProgressBar } from './ProgressBar';
import { ReplacementItem, type ReplacementEditForm } from './ReplacementItem';

interface Props {
    type: string;
    items: Replacement[];
    componentName: string;
    selectedVehicle: Vehicle;
    isOpen: boolean;
    onToggle: () => void;
    onToggleNotify: () => void;
    editingReplacementId: number | null;
    editForm: ReplacementEditForm;
    today: string;
    repairs: Repair[];
    onEditFormChange: (partial: Partial<ReplacementEditForm>) => void;
    onStartEdit: (replacement: Replacement) => void;
    onCancelEdit: () => void;
    onSaveEdit: () => void;
    onDelete: (replacement: Replacement) => void;
}

export function ReplacementGroup({
    type,
    items,
    componentName,
    selectedVehicle,
    isOpen,
    onToggle,
    onToggleNotify,
    editingReplacementId,
    editForm,
    today,
    repairs,
    onEditFormChange,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onDelete,
}: Props) {
    const status = items[0]?.status || 'unknown';
    const statusStyle = getReplacementStatusStyle(status);
    const isDateBased = isDateBasedComponent(type);
    const isDateOnly = isDateOnlyComponent(type);
    const notificationsEnabled = selectedVehicle.notify_flags?.[type] ?? true;

    return (
        <div className="md3-card overflow-hidden">
            <button
                onClick={onToggle}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left ${statusStyle.bg} ${statusStyle.text} transition-colors`}
                aria-expanded={isOpen}
            >
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                >
                    <polygon points="8 5 19 12 8 19 8 5" />
                </svg>
                <span>{statusStyle.icon}</span>
                <span className="text-label-lg flex-1">{componentName || type}</span>
                <button
                    onClick={(event) => {
                        event.stopPropagation();
                        onToggleNotify();
                    }}
                    className="text-label-lg hover:opacity-70 transition-opacity"
                    aria-label={notificationsEnabled ? 'Отключить уведомления' : 'Включить уведомления'}
                >
                    {notificationsEnabled ? '🔔' : '🔕'}
                </button>
                <span className="text-label-sm opacity-70">
                    {items.length} {items.length === 1 ? 'замена' : 'замен'}
                </span>
            </button>

            <div className="px-4 pb-2">
                <ProgressBar
                    value={isDateBased ? getDateProgress(items) : getKmProgress(selectedVehicle, type)}
                    status={status}
                />
            </div>

            {isOpen && (
                <div className="flex flex-col gap-2 p-3">
                    {items.map((replacement, index) => {
                        const itemStyle = getReplacementStatusStyle(replacement.status);
                        const endKm = index === 0
                            ? selectedVehicle.current_km
                            : items[index - 1].km_at_replacement;
                        const kmTraveled = type === 'tire_change' && replacement.km_traveled != null
                            ? replacement.km_traveled
                            : isDateOnly
                                ? 0
                                : Math.max(0, endKm - replacement.km_at_replacement);

                        return (
                            <ReplacementItem
                                key={replacement.id}
                                replacement={replacement}
                                isFirst={index === 0}
                                itemStyle={itemStyle}
                                editing={editingReplacementId === replacement.id}
                                editForm={editForm}
                                today={today}
                                kmTraveled={kmTraveled}
                                blockedByRepair={findBlockingRepair(
                                    repairs,
                                    replacement.replacement_date,
                                    replacement.component_type,
                                )}
                                onEditFormChange={onEditFormChange}
                                onStartEdit={() => onStartEdit(replacement)}
                                onCancelEdit={onCancelEdit}
                                onSaveEdit={onSaveEdit}
                                onDelete={() => onDelete(replacement)}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
