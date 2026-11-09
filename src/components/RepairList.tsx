import { api } from '../api/client';
import { useCrudList } from '../hooks/useCrudList';
import { useComponentConfigs } from '../hooks/useEnums';
import type { Repair, RepairPayload, Replacement, Vehicle } from '../types';
import { Modal } from './Modal';
import { RepairForm } from './RepairForm';
import { VehicleCardHeader } from './VehicleCardHeader';

interface Props {
  repairs: Repair[];
  replacements: Replacement[];
  vehicleId: number | null;
  selectedVehicle: Vehicle | undefined;
  onClose: () => void;
  onShare: () => void;
  onRepairsUpdate: () => void;
}

function formatMoney(value: number | null): string {
  return value == null ? '—' : `${value.toLocaleString()} ₽`;
}

export function RepairList({
  repairs,
  replacements,
  vehicleId,
  selectedVehicle,
  onClose,
  onShare,
  onRepairsUpdate,
}: Props) {
  const { data: configsData } = useComponentConfigs();
  const {
    showForm,
    editing,
    openCreateForm,
    openEditForm,
    closeForm,
    handleSubmit,
    handleDelete,
  } = useCrudList<Repair, RepairPayload>({
    vehicleId,
    create: api.createRepair,
    update: api.updateRepair,
    remove: api.deleteRepair,
    onChanged: onRepairsUpdate,
    createSuccess: 'Ремонт добавлен',
    updateSuccess: 'Ремонт обновлён',
    saveError: 'Не удалось сохранить ремонт',
    deleteSuccess: 'Ремонт удалён',
    deleteError: 'Не удалось удалить ремонт',
    getDeleteConfirm: repair => `Удалить ремонт от ${repair.repair_date}?`,
  });

  if (!vehicleId || !selectedVehicle) return null;

  const today = new Date().toISOString().split('T')[0];
  const componentNames = Object.fromEntries(
    (configsData?.configs ?? []).map(config => [config.key, config.name]),
  );
  const sortedRepairs = [...repairs].sort((a, b) => {
    const dateDiff = new Date(b.repair_date).getTime() - new Date(a.repair_date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return b.id - a.id;
  });

  return (
    <div className="md3-card overflow-hidden animate-fade-in">
      <VehicleCardHeader
        vehicle={selectedVehicle}
        title={`Ремонт или обслуживание: ${selectedVehicle.brand} ${selectedVehicle.model}`}
        onClose={onClose}
        onShare={onShare}
      />

      <div className="p-4">
        {sortedRepairs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center">
              <span className="text-xl">🔧</span>
            </div>
            <p className="text-title-sm text-surface-on mb-1">Нет ремонтов</p>
            <p className="text-body-md text-outline max-w-sm">
              Добавьте ремонт или обслуживание: укажите дату, пробег и компоненты, которые
              заменили. Стоимость указывается один раз в ремонте, отдельные замены создадутся
              автоматически.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedRepairs.map(repair => (
              <div key={repair.id} className="p-4 rounded-md3-sm bg-surface border border-outline-variant">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-label-lg text-surface-on m-0">📅 {repair.repair_date}</p>
                    <p className="text-body-sm text-outline m-0">
                      📍 {repair.km_at_repair.toLocaleString()} км
                    </p>
                    <p className="text-body-sm text-outline m-0">
                      🔧 Работы: {formatMoney(repair.work_cost)} · 🧾 Запчасти: {formatMoney(repair.parts_cost)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-title-sm text-surface-on">
                      {formatMoney(repair.work_cost + repair.parts_cost)}
                    </span>
                    <button
                      onClick={() => openEditForm(repair)}
                      className="flex items-center justify-center w-8 h-8 rounded-md3-full text-surface-on-variant hover:bg-surface-variant transition-colors"
                      aria-label="Редактировать ремонт"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(repair)}
                      className="flex items-center justify-center w-8 h-8 rounded-md3-full text-error hover:bg-error-container transition-colors"
                      aria-label="Удалить ремонт"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                </div>

                {repair.description && (
                  <p className="mt-3 text-body-md text-surface-on whitespace-pre-line m-0">
                    {repair.description}
                  </p>
                )}

                {repair.component_types.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {repair.component_types.map(type => (
                      <span
                        key={type}
                        className="md3-badge bg-surface-variant text-surface-on-variant"
                      >
                        {componentNames[type] ?? type}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <button onClick={openCreateForm} className="md3-btn-primary w-full">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Добавить ремонт
          </button>
        </div>
      </div>

      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editing ? 'Редактировать ремонт' : 'Новый ремонт'}
      >
        <RepairForm
          key={editing?.id ?? 'new'}
          vehicle={selectedVehicle}
          replacements={replacements}
          initial={editing}
          today={today}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>
    </div>
  );
}
