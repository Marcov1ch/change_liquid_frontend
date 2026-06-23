export interface Vehicle {
    id: number;
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

export interface Replacement {
    id: number;
    liquid_name: string;
    liquid_type: string;
    km_at_replacement: number;
    replacement_date: string;
    interval_km: number;
    next_replacement_km: number;
}

export interface Brand {
    value: string;
    label: string;
}

export interface NewVehicle {
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