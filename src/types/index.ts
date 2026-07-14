export interface Vehicle {
    id: number;
    brand: string;
    model: string;
    brand_id: number;
    model_id: number;
    plate_number: string;
    year: number;
    current_km: number;
    is_active: boolean;
    intervals: Record<string, number>;
    notify_flags: Record<string, boolean>;
    km_remaining: Record<string, number | null>;
    vehicle_status?: string;
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
    status?: string;
    status_message?: string;
}

export interface Brand {
    value: string;
    label: string;
}

export interface ComponentConfig {
    key: string;
    name: string;
    default_interval: number;
}

export interface VehicleFormData {
    brand: string;
    model: string;
    plate_number: string;
    year: number;
    current_km: number;
    intervals: Record<string, number>;
    notify_flags: Record<string, boolean>;
}

export interface User {
    id: number;
    username: string;
    email: string;
    is_active: boolean;
    created_at: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
}
