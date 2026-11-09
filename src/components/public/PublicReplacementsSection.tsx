import { useMemo } from 'react';
import type { PublicReplacement } from '../../types';
import { formatPublicMoney, getPublicReplacementNote } from '../../utils/publicVehicle';
import { isDateOnlyComponent } from '../../utils/replacementTypes';
import { groupReplacements } from '../../utils/replacementList';
import { getReplacementStatusStyle } from '../../utils/statusStyles';

interface Props {
    replacements: PublicReplacement[];
    componentNames: Record<string, string>;
}

export function PublicReplacementsSection({ replacements, componentNames }: Props) {
    const grouped = useMemo(() => groupReplacements(replacements), [replacements]);

    return (
        <div className="md3-card p-6">
            <h2 className="text-title-md text-surface-on mb-4">История замен</h2>

            {replacements.length === 0 ? (
                <p className="text-body-md text-outline">Замены пока не добавлены.</p>
            ) : (
                <div className="flex flex-col gap-5">
                    {Object.entries(grouped).map(([type, items]) => (
                        <div key={type}>
                            <h3 className="text-label-lg text-surface-on mb-2">
                                {componentNames[type] ?? type}
                            </h3>
                            <div className="flex flex-col gap-2">
                                {items.map((replacement, index) => (
                                    <PublicReplacementRow
                                        key={replacement.id}
                                        replacement={replacement}
                                        isFirst={index === 0}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function PublicReplacementRow({
    replacement,
    isFirst,
}: {
    replacement: PublicReplacement;
    isFirst: boolean;
}) {
    const style = getReplacementStatusStyle(replacement.status);
    const note = getPublicReplacementNote(replacement);
    const isDateOnly = isDateOnlyComponent(replacement.component_type);
    const isParking = replacement.component_type === 'parking_monthly';

    return (
        <div className={`p-3 rounded-md3-sm border-l-4 ${style.border} bg-surface`}>
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-label-lg text-surface-on">
                    {isFirst && <span className="mr-1">{style.icon}</span>}
                    {replacement.component_name}
                </span>
                {isFirst && (
                    <span className="md3-badge bg-primary-container text-primary-on-container">
                        последняя
                    </span>
                )}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-outline">
                <span>📅 {replacement.replacement_date}</span>
                {isDateOnly ? (
                    <>
                        <span>
                            🧾 {isParking ? 'Аренда' : 'Страховка'}:{' '}
                            {formatPublicMoney(replacement.component_price)}
                        </span>
                        {replacement.next_change_date && (
                            <span>📅 До: {replacement.next_change_date}</span>
                        )}
                    </>
                ) : (
                    <>
                        <span>📍 {replacement.km_at_replacement.toLocaleString()} км</span>
                        {replacement.component_type === 'tire_change' && replacement.km_traveled != null && (
                            <span>🛣 Пройдено: {replacement.km_traveled.toLocaleString()} км</span>
                        )}
                        <span>🧾 {formatPublicMoney(replacement.component_price)}</span>
                        <span>🔧 {formatPublicMoney(replacement.work_price)}</span>
                        {replacement.next_change_date && (
                            <span>📅 До: {replacement.next_change_date}</span>
                        )}
                    </>
                )}
            </div>
            {note && (
                <p className={`text-body-sm mt-1 m-0 ${style.text}`}>{note}</p>
            )}
        </div>
    );
}
