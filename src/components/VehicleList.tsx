import { useState } from 'react';
import type { Vehicle } from '../types';

interface Props {
  vehicles: Vehicle[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onEditVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (id: number) => void;
  onHardDeleteVehicle: (id: number) => void;
  onRestoreVehicle: (id: number) => void;
  onUpdateKm: (vehicleId: number, newKm: number) => Promise<void>;
  showArchived: boolean;
  statusIcons: Record<string, string>;
  getVehicleStatus: (vehicle: Vehicle) => string;
}

const statusColors: Record<string, string> = {
  overdue: 'bg-error-container text-error-on-container border-l-error',
  critical: 'bg-[#FFF0E6] text-[#7A2D00] border-l-[#E06900]',
  warning: 'bg-[#FFF8E1] text-[#7A6100] border-l-[#FFC107]',
  good: 'bg-[#E6F7E6] text-[#1B5E1B] border-l-[#28A745]',
  unknown: 'bg-surface-variant/50 text-surface-on-variant border-l-outline',
};

export function VehicleList({
  vehicles, selectedId, onSelect, onEditVehicle, onDeleteVehicle,
  onHardDeleteVehicle, onRestoreVehicle, onUpdateKm, showArchived,
  statusIcons, getVehicleStatus,
}: Props) {
  const [editingKm, setEditingKm] = useState<number | null>(null);
  const [newKmValue, setNewKmValue] = useState<string>('');

  const handleUpdateKm = async (vehicleId: number, currentKm: number) => {
    const newKm = parseInt(newKmValue);
    if (isNaN(newKm) || newKm <= currentKm) {
      alert('Пробег должен быть больше текущего');
      return;
    }
    try {
      await onUpdateKm(vehicleId, newKm);
      setEditingKm(null);
      setNewKmValue('');
    } catch {
      // handled in parent
    }
  };

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-variant flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#44474E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 16H9m5-4H9m5-4H9" /><path d="M17 4H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
          </svg>
        </div>
        <p className="text-title-md text-outline mb-1">Нет автомобилей</p>
        <p className="text-body-md text-outline">Добавьте первый автомобиль</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {vehicles.map(vehicle => {
        const status = getVehicleStatus(vehicle);
        const icon = statusIcons[status] || '⚪';


        return (
          <div
            key={vehicle.id}
            className={`md3-card overflow-hidden transition-all duration-200 ${
              selectedId === vehicle.id ? 'ring-2 ring-primary shadow-md3-2' : ''
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
              <div
                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                onClick={() => onSelect(vehicle.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(vehicle.id); }}
                aria-label={`Выбрать ${vehicle.brand} ${vehicle.model}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${statusColors[status]?.split(' ')[0] || 'bg-surface-variant'}`}>
                  <span role="img" aria-label={status}>{icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-title-md text-surface-on truncate">
                    {vehicle.brand} {vehicle.model}
                  </p>
                  <p className="text-body-sm text-outline truncate">
                    {vehicle.current_km.toLocaleString()} км · {vehicle.plate_number}
                    {status === 'unknown' && <span className="text-error ml-1">*</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {!showArchived ? (
                  <>
                    <button
                      onClick={() => onEditVehicle(vehicle)}
                      className="md3-btn-tonal !px-3 !py-2 !rounded-md3-sm text-label-sm"
                      aria-label="Редактировать"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      <span className="hidden sm:inline">Правка</span>
                    </button>

                    <button
                      onClick={() => onDeleteVehicle(vehicle.id)}
                      className="md3-btn !px-3 !py-2 !rounded-md3-sm text-label-sm bg-[#FFF8E1] text-[#7A6100] hover:bg-[#FFECB3] active:bg-[#FFE082]"
                      aria-label="В архив"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>

                    {editingKm === vehicle.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={newKmValue}
                          onChange={(e) => setNewKmValue(e.target.value)}
                          placeholder="Новый пробег"
                          className="md3-field !w-28 !py-2 !text-label-md"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateKm(vehicle.id, vehicle.current_km)}
                          className="md3-btn-primary !px-3 !py-2 !rounded-md3-sm text-label-sm"
                          aria-label="Подтвердить пробег"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>
                        <button
                          onClick={() => { setEditingKm(null); setNewKmValue(''); }}
                          className="md3-btn-text !px-3 !py-2 !rounded-md3-sm text-label-sm"
                          aria-label="Отменить"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingKm(vehicle.id)}
                        className="md3-btn-primary !px-3 !py-2 !rounded-md3-sm text-label-sm"
                        aria-label="Обновить пробег"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span className="hidden sm:inline">Пробег</span>
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onRestoreVehicle(vehicle.id)}
                      className="md3-btn-tonal !px-3 !py-2 !rounded-md3-sm text-label-sm"
                      aria-label="Восстановить"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                      </svg>
                      <span className="hidden sm:inline">Восстановить</span>
                    </button>
                    <button
                      onClick={() => onHardDeleteVehicle(vehicle.id)}
                      className="md3-btn-danger !px-3 !py-2 !rounded-md3-sm text-label-sm"
                      aria-label="Удалить навсегда"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
