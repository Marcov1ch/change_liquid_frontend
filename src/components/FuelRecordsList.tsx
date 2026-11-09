import { api } from '../api/client';
import { useCrudList } from '../hooks/useCrudList';
import type { FuelRecord, FuelRecordPayload, Vehicle } from '../types';
import { FuelRecordForm } from './FuelRecordForm';
import { Modal } from './Modal';
import { VehicleCardHeader } from './VehicleCardHeader';

interface Props {
  records: FuelRecord[];
  vehicleId: number | null;
  selectedVehicle: Vehicle | undefined;
  onClose: () => void;
  onShare: () => void;
  onRecordsUpdate: () => void;
}

function formatMoney(value: number): string {
  return `${value.toLocaleString()} ₽`;
}

function formatLiters(value: number): string {
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 3 })} л`;
}

function formatConsumption(value: number | null): string {
  return value == null ? '—' : `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} л/100 км`;
}

export function FuelRecordsList({
  records,
  vehicleId,
  selectedVehicle,
  onClose,
  onShare,
  onRecordsUpdate,
}: Props) {
  const {
    showForm,
    editing,
    openCreateForm,
    openEditForm,
    closeForm,
    handleSubmit,
    handleDelete,
  } = useCrudList<FuelRecord, FuelRecordPayload>({
    vehicleId,
    create: api.createFuelRecord,
    update: api.updateFuelRecord,
    remove: api.deleteFuelRecord,
    onChanged: onRecordsUpdate,
    createSuccess: 'Заправка добавлена',
    updateSuccess: 'Заправка обновлена',
    saveError: 'Не удалось сохранить заправку',
    deleteSuccess: 'Заправка удалена',
    deleteError: 'Не удалось удалить заправку',
    getDeleteConfirm: record => `Удалить заправку от ${record.fuel_date}?`,
  });

  if (!vehicleId || !selectedVehicle) return null;

  const today = new Date().toISOString().split('T')[0];
  const sortedRecords = [...records].sort((a, b) => {
    const dateDiff = new Date(b.fuel_date).getTime() - new Date(a.fuel_date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return b.id - a.id;
  });
  const totalLiters = sortedRecords.reduce((sum, record) => sum + record.liters, 0);
  const totalCost = sortedRecords.reduce((sum, record) => sum + record.total_cost, 0);

  return (
    <div className="md3-card overflow-hidden animate-fade-in">
      <VehicleCardHeader
        vehicle={selectedVehicle}
        title={`Заправки: ${selectedVehicle.brand} ${selectedVehicle.model}`}
        onClose={onClose}
        onShare={onShare}
      />

      <div className="p-4">
        {sortedRecords.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center">
              <span className="text-xl">⛽</span>
            </div>
            <p className="text-title-sm text-surface-on mb-1">Нет заправок</p>
            <p className="text-body-md text-outline max-w-sm">
              Добавляйте заправки, чтобы учитывать расход топлива и общие затраты на автомобиль.
              Расход л/100 км считается автоматически по разнице пробега.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sortedRecords.map(record => (
              <div
                key={record.id}
                className="flex items-center justify-between gap-3 p-3 rounded-md3-sm bg-surface border border-outline-variant"
              >
                <div className="min-w-0">
                  <p className="text-label-lg text-surface-on m-0">📅 {record.fuel_date}</p>
                  <p className="text-body-sm text-outline m-0">
                    📍 {record.km_at_fuel.toLocaleString()} км · ⛽ {formatLiters(record.liters)}
                  </p>
                  <p className="text-body-sm text-outline m-0">
                    📊 Расход: {formatConsumption(record.consumption_l_per_100km)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-title-sm text-surface-on">{formatMoney(record.total_cost)}</span>
                  <button
                    onClick={() => openEditForm(record)}
                    className="flex items-center justify-center w-8 h-8 rounded-md3-full text-surface-on-variant hover:bg-surface-variant transition-colors"
                    aria-label="Редактировать заправку"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(record)}
                    className="flex items-center justify-center w-8 h-8 rounded-md3-full text-error hover:bg-error-container transition-colors"
                    aria-label="Удалить заправку"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {sortedRecords.length > 0 && (
          <div className="mt-4 pt-4 border-t border-outline-variant flex items-center justify-between flex-wrap gap-2">
            <span className="text-label-lg text-surface-on-variant">
              Итого: {formatLiters(totalLiters)}
            </span>
            <span className="text-title-md text-surface-on">{formatMoney(totalCost)}</span>
          </div>
        )}

        <div className="mt-4">
          <button onClick={openCreateForm} className="md3-btn-primary w-full">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Добавить заправку
          </button>
        </div>
      </div>

      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editing ? 'Редактировать заправку' : 'Новая заправка'}
      >
        <FuelRecordForm
          key={editing?.id ?? 'new'}
          vehicle={selectedVehicle}
          initial={editing}
          today={today}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>
    </div>
  );
}
