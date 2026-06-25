export interface Vehicle {
    id: number;
    brand: string;
    model: string;
    plate_number: string;
    year: number;
    current_km: number;
    is_active: boolean;
    oil_interval_km: number;
    transmission_interval_km: number;
    brake_interval_km: number;
    coolant_interval_km: number;
    power_steering_interval_km: number;
    differential_oil_interval_km: number;
    vehicle_status?: string;
    oil_km_remaining?: number | null;
    transmission_km_remaining?: number | null;
    brake_km_remaining?: number | null;
    coolant_km_remaining?: number | null;
    power_steering_km_remaining?: number | null;
    differential_oil_km_remaining?: number | null;
}

export interface Replacement {
    id: number;
    vehicle_id: number;
    liquid_name: string;
    liquid_type: string;
    liquid_price: number | null;
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

export interface VehicleFormData {
    brand: string;
    model: string;
    plate_number: string;
    year: number;
    current_km: number;
    oil_interval_km: number;
    transmission_interval_km: number;
    brake_interval_km: number;
    coolant_interval_km: number;
    power_steering_interval_km: number;
    differential_oil_interval_km: number;
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