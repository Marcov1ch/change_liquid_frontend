import type { TireSet } from '../types';
import { TIRE_SEASON_ICONS } from '../utils/tireSets';

interface Props {
    tireSets: TireSet[];
    installing: boolean;
    onInstall: (tireSet: TireSet) => void;
}

export function TireSetSwitchSection({ tireSets, installing, onInstall }: Props) {
    if (tireSets.length === 0) return null;

    return (
        <div>
            <p className="text-label-lg text-surface-on mb-2">Переключить на</p>
            <div className="flex flex-wrap gap-2">
                {tireSets.map(tireSet => (
                    <button
                        key={tireSet.id}
                        onClick={() => onInstall(tireSet)}
                        disabled={installing}
                        className="md3-btn-tonal disabled:opacity-60"
                    >
                        {TIRE_SEASON_ICONS[tireSet.season]} {tireSet.name}
                    </button>
                ))}
            </div>
            <p className="text-body-sm text-outline mt-2 mb-0">
                Пробег текущего комплекта сохранится, а новый продолжит считать с текущего пробега авто.
            </p>
        </div>
    );
}
