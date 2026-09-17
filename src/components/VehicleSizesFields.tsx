import { Spoiler } from './Spoiler';
import type { RimSize, TireSize } from '../types';

interface Props {
    rims: RimSize[];
    tires: TireSize[];
    onRimsChange: (rims: RimSize[]) => void;
    onTiresChange: (tires: TireSize[]) => void;
}

const emptyRim = (): RimSize => ({
    diameter: null,
    pcd: '',
    et_from: null,
    et_to: null,
    width_from: null,
    width_to: null,
});

const emptyTire = (): TireSize => ({ size: '', label: '' });

function numberValue(v: number | null | undefined): string {
    return v == null || Number.isNaN(v) ? '' : String(v);
}

export function VehicleSizesFields({ rims, tires, onRimsChange, onTiresChange }: Props) {
    const updateRim = (index: number, patch: Partial<RimSize>) => {
        onRimsChange(rims.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    };

    const removeRim = (index: number) => {
        onRimsChange(rims.filter((_, i) => i !== index));
    };

    const updateTire = (index: number, patch: Partial<TireSize>) => {
        onTiresChange(tires.map((t, i) => (i === index ? { ...t, ...patch } : t)));
    };

    const removeTire = (index: number) => {
        onTiresChange(tires.filter((_, i) => i !== index));
    };

    const numField = (value: number | null, onValue: (v: number | null) => void, step = '1', placeholder = '') => (
        <input
            type="number"
            step={step}
            placeholder={placeholder}
            value={numberValue(value)}
            onChange={(e) => onValue(e.target.value === '' ? null : Number(e.target.value))}
            className="md3-field"
        />
    );

    return (
        <Spoiler title="Шины и диски">
            <div className="flex flex-col gap-4 pt-3">
                <div>
                    <h5 className="text-label-lg text-surface-on mb-2">Диски</h5>
                    {rims.length === 0 ? (
                        <p className="text-body-sm text-outline mb-2">Размеры дисков не указаны.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {rims.map((rim, i) => (
                                <div key={i} className="p-3 rounded-md3-sm bg-surface-variant/50 border border-outline-variant flex flex-col gap-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-label-sm text-surface-on-variant mb-1">Диаметр (дюймы)</label>
                                            {numField(rim.diameter, (v) => updateRim(i, { diameter: v }), '1', '15')}
                                        </div>
                                        <div>
                                            <label className="block text-label-sm text-surface-on-variant mb-1">Сверловка (PCD)</label>
                                            <input
                                                type="text"
                                                placeholder="5x114.3"
                                                value={rim.pcd}
                                                onChange={(e) => updateRim(i, { pcd: e.target.value })}
                                                className="md3-field"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-label-sm text-surface-on-variant mb-1">Вылет ET, от</label>
                                            {numField(rim.et_from, (v) => updateRim(i, { et_from: v }), '1', '45')}
                                        </div>
                                        <div>
                                            <label className="block text-label-sm text-surface-on-variant mb-1">Вылет ET, до</label>
                                            {numField(rim.et_to, (v) => updateRim(i, { et_to: v }), '1', '50')}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-label-sm text-surface-on-variant mb-1">Ширина, от</label>
                                            {numField(rim.width_from, (v) => updateRim(i, { width_from: v }), '0.5', '6')}
                                        </div>
                                        <div>
                                            <label className="block text-label-sm text-surface-on-variant mb-1">Ширина, до</label>
                                            {numField(rim.width_to, (v) => updateRim(i, { width_to: v }), '0.5', '6.5')}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeRim(i)}
                                        className="self-end md3-btn-text !py-1 !px-3 text-label-sm !text-error"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => onRimsChange([...rims, emptyRim()])}
                        className="mt-2 md3-btn-tonal !py-2 !px-3 text-label-sm"
                    >
                        + Добавить диск
                    </button>
                </div>

                <hr className="md3-divider" />

                <div>
                    <h5 className="text-label-lg text-surface-on mb-2">Шины</h5>
                    {tires.length === 0 ? (
                        <p className="text-body-sm text-outline mb-2">Размеры шин не указаны.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {tires.map((tire, i) => (
                                <div key={i} className="p-3 rounded-md3-sm bg-surface-variant/50 border border-outline-variant flex flex-col gap-2">
                                    <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                                        <div>
                                            <label className="block text-label-sm text-surface-on-variant mb-1">Размер</label>
                                            <input
                                                type="text"
                                                placeholder="215/65 R16"
                                                value={tire.size}
                                                onChange={(e) => updateTire(i, { size: e.target.value })}
                                                className="md3-field"
                                            />
                                        </div>
                                        <div className="flex gap-1">
                                            <input
                                                type="text"
                                                placeholder="лето"
                                                value={tire.label || ''}
                                                onChange={(e) => updateTire(i, { label: e.target.value })}
                                                title="Подпись (сезон, бренд)"
                                                className="md3-field !w-28"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeTire(i)}
                                                className="md3-btn-text !py-2 !px-2 text-label-sm !text-error shrink-0"
                                                aria-label="Удалить размер"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => onTiresChange([...tires, emptyTire()])}
                        className="mt-2 md3-btn-tonal !py-2 !px-3 text-label-sm"
                    >
                        + Добавить размер шины
                    </button>
                </div>
            </div>
        </Spoiler>
    );
}