import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { StatisticsPanel } from '../components/StatisticsPanel';
import { PublicFuelRecordsSection } from '../components/public/PublicFuelRecordsSection';
import { PublicOtherExpensesSection } from '../components/public/PublicOtherExpensesSection';
import { PublicRegisterCta } from '../components/public/PublicRegisterCta';
import { PublicRepairsSection } from '../components/public/PublicRepairsSection';
import { PublicReplacementsSection } from '../components/public/PublicReplacementsSection';
import { PublicTireSetsSection } from '../components/public/PublicTireSetsSection';
import { PublicVehicleSummary } from '../components/public/PublicVehicleSummary';
import { REPLACEMENT_TYPE_LABELS } from '../utils/replacementTypes';
import { calcTotalCost } from '../utils/publicTotals';

export function PublicVehiclePage() {
    const { token } = useParams<{ token: string }>();

    const { data: configsData } = useQuery({
        queryKey: ['enums', 'component-configs-public'],
        queryFn: api.getPublicComponentConfigs,
        staleTime: Infinity,
    });

    const { data: vehicle, isLoading, error } = useQuery({
        queryKey: ['public-vehicle', token],
        queryFn: () => api.getPublicVehicle(token!),
        enabled: !!token,
        retry: false,
    });

    const componentNames = useMemo(() => {
        const names: Record<string, string> = {};
        configsData?.configs.forEach(config => {
            names[config.key] = config.name;
        });
        Object.assign(names, REPLACEMENT_TYPE_LABELS);
        return names;
    }, [configsData]);

    const hasTireSets = (vehicle?.tire_sets?.length ?? 0) > 0;

    const visibleReplacements = useMemo(() => {
        const all = vehicle?.replacements ?? [];
        return hasTireSets
            ? all.filter(replacement => replacement.component_type !== 'tire_change')
            : all;
    }, [vehicle, hasTireSets]);

    const otherExpenses = vehicle?.other_expenses ?? [];
    const repairs = vehicle?.repairs ?? [];
    const fuelRecords = vehicle?.fuel_records ?? [];
    const tireSets = vehicle?.tire_sets ?? [];

    const totalCost = useMemo(() => {
        return vehicle
            ? calcTotalCost(
                vehicle.replacements,
                vehicle.repairs ?? [],
                vehicle.fuel_records ?? [],
                vehicle.other_expenses ?? [],
            )
            : 0;
    }, [vehicle]);

    return (
        <div className="min-h-screen bg-surface">
            <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-sm border-b border-outline-variant shadow-md3-1">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A6DFF" strokeWidth="1.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                    </svg>
                    <div>
                        <h1 className="text-title-md text-surface-on m-0">ChangeLiquid</h1>
                        <p className="text-body-sm text-outline m-0">История обслуживания автомобиля</p>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6">
                {isLoading && (
                    <div className="md3-card p-8 text-center text-outline">Загрузка...</div>
                )}

                {error && (
                    <div className="md3-card p-8 text-center">
                        <div className="w-14 h-14 rounded-full bg-error-container flex items-center justify-center mx-auto mb-4 text-2xl">🔒</div>
                        <h2 className="text-title-md text-surface-on mb-2">Ссылка недоступна</h2>
                        <p className="text-body-md text-outline">
                            {error instanceof Error ? error.message : 'Ссылка не найдена или отключена'}
                        </p>
                    </div>
                )}

                {vehicle && (
                    <div className="flex flex-col gap-5 animate-slide-up">
                        <PublicVehicleSummary
                            vehicle={vehicle}
                            replacementsCount={visibleReplacements.length}
                            fuelRecordsCount={fuelRecords.length}
                            repairsCount={repairs.length}
                            otherExpensesCount={otherExpenses.length}
                            totalCost={totalCost}
                        />

                        <div className="md3-card p-6">
                            <StatisticsPanel
                                replacements={vehicle.replacements}
                                repairs={repairs}
                                fuelRecords={fuelRecords}
                                otherExpenses={otherExpenses}
                            />
                        </div>

                        <PublicTireSetsSection tireSets={tireSets} />
                        <PublicReplacementsSection
                            replacements={visibleReplacements}
                            componentNames={componentNames}
                        />
                        <PublicFuelRecordsSection records={fuelRecords} />
                        <PublicRepairsSection
                            repairs={repairs}
                            componentNames={componentNames}
                        />
                        <PublicOtherExpensesSection expenses={otherExpenses} />
                        <PublicRegisterCta registerUrl={vehicle.register_url} />
                    </div>
                )}
            </main>
        </div>
    );
}
