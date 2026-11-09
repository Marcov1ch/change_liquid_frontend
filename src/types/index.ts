export interface RimSize {
    diameter: number | null;
    pcd: string;
    et_from: number | null;
    et_to: number | null;
    width_from: number | null;
    width_to: number | null;
}

export interface TireSize {
    size: string;
    label: string | null;
}

export interface Vehicle {
    id: number;
    brand: string;
    model: string;
    plate_number: string;
    year: number;
    current_km: number;
    is_active: boolean;
    intervals: Record<string, number>;
    notify_flags: Record<string, boolean>;
    interval_months: Record<string, number | null>;
    km_remaining: Record<string, number | null>;
    vehicle_status?: string;
    rims: RimSize[];
    tires: TireSize[];
}

export type TireSeason = 'summer' | 'winter' | 'all_season';

export type TireEventType = 'purchase' | 'install';

export interface TireSet {
    id: number;
    vehicle_id: number;
    name: string;
    season: TireSeason;
    purchase_date: string | null;
    purchase_price: number | null;
    accumulated_km: number;
    installed_km: number | null;
    installed_date: string | null;
    is_installed: boolean;
    next_change_date: string | null;
    status: string | null;
    days_remaining: number | null;
    total_km: number;
    created_at: string | null;
}

export interface TireSetPayload {
    name: string;
    season: TireSeason;
    purchase_date?: string | null;
    purchase_price?: number | null;
    install_now?: boolean;
    work_price?: number | null;
    next_change_date?: string | null;
}

export interface TireInstallPayload {
    switch_date?: string;
    next_change_date?: string | null;
    work_price?: number | null;
}

export interface TireInstallResponse {
    tire_set: TireSet;
    replacement: Replacement;
}

export interface Replacement {
    id: number;
    vehicle_id: number;
    component_name: string;
    component_type: string;
    component_price: number | null;
    work_price: number | null;
    km_at_replacement: number;
    replacement_date: string;
    interval_km: number;
    next_replacement_km?: number;
    km_remaining?: number;
    km_traveled?: number | null;
    next_change_date?: string | null;
    days_remaining?: number | null;
    status?: string;
    source_repair_id?: number | null;
    tire_set_id?: number | null;
    tire_event_type?: TireEventType | null;
}

export interface FuelRecord {
    id: number;
    vehicle_id: number;
    fuel_date: string;
    km_at_fuel: number;
    liters: number;
    total_cost: number;
    consumption_l_per_100km: number | null;
}

export interface FuelRecordPayload {
    fuel_date: string;
    km_at_fuel: number;
    liters: number;
    total_cost: number;
}

export interface Repair {
    id: number;
    vehicle_id: number;
    repair_date: string;
    km_at_repair: number;
    description: string | null;
    work_cost: number;
    parts_cost: number;
    component_types: string[];
}

export interface RepairPayload {
    repair_date: string;
    km_at_repair: number;
    description: string | null;
    work_cost: number;
    parts_cost: number;
    component_types: string[];
}

export interface OtherExpense {
    id: number;
    vehicle_id: number;
    name: string;
    expense_date: string;
    amount: number;
}

export interface OtherExpensePayload {
    name: string;
    expense_date: string;
    amount: number;
}

export interface ShareLink {
    enabled: boolean;
    token: string | null;
    share_url: string | null;
    register_url: string;
}

export type PublicReplacement = Omit<Replacement, 'vehicle_id'>;

export type PublicTireSet = Pick<
    TireSet,
    'id' | 'name' | 'season' | 'purchase_date' | 'purchase_price' | 'is_installed' | 'installed_date' | 'next_change_date' | 'status' | 'days_remaining' | 'total_km'
>;

export type PublicOtherExpense = Omit<OtherExpense, 'vehicle_id'>;

export type PublicFuelRecord = Omit<FuelRecord, 'vehicle_id'>;

export type PublicRepair = Omit<Repair, 'vehicle_id'>;

export interface PublicVehicle {
    brand: string;
    model: string;
    plate_number: string;
    year: number;
    current_km: number;
    vehicle_status: string;
    replacements: PublicReplacement[];
    tire_sets: PublicTireSet[];
    other_expenses: PublicOtherExpense[];
    repairs: PublicRepair[];
    fuel_records: PublicFuelRecord[];
    register_url: string;
}

export interface MonthlyStatistics {
    month: number;
    replacements: number;
    repairs: number;
    fuel: number;
    other_expenses: number;
    total: number;
}

export interface StatisticsTotals {
    replacements: number;
    repairs: number;
    fuel: number;
    other_expenses: number;
    total: number;
}

export interface VehicleStatistics {
    year: number;
    available_years: number[];
    months: MonthlyStatistics[];
    totals: StatisticsTotals;
    max_monthly_total: number;
}

export interface ComponentConfig {
    key: string;
    name: string;
    example: string;
    default_interval: number;
    default_interval_months?: number | null;
}

export interface VehicleFormData {
    brand: string;
    model: string;
    plate_number: string;
    year: number;
    current_km: number;
    intervals: Record<string, number>;
    notify_flags: Record<string, boolean>;
    interval_months: Record<string, number | null>;
}

export interface User {
    id: number;
    username: string;
    email: string;
    email_verified: boolean;
    is_active: boolean;
    created_at: string;
}
