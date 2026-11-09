import type { RimSize, TireSize, Vehicle, VehicleFormData } from '../types'
import { API_BASE, authFetch, handleResponse, type ActionResponse } from './http'

export const vehiclesApi = {
    getAllVehicles: () =>
        authFetch(`${API_BASE}/vehicles?include_archived=true`).then(res => handleResponse<Vehicle[]>(res)),

    createVehicle: (data: VehicleFormData) =>
        authFetch(`${API_BASE}/vehicles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(res => handleResponse<Vehicle>(res)),

    updateVehicle: (vehicleId: number, data: Partial<VehicleFormData>) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(res => handleResponse<Vehicle>(res)),

    updateVehicleKm: (vehicleId: number, newKm: number) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/km`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ new_km: newKm }),
        }).then(res => handleResponse<Vehicle>(res)),

    deleteVehicle: (vehicleId: number) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}`, { method: 'DELETE' })
            .then(res => handleResponse<ActionResponse>(res)),

    hardDeleteVehicle: (vehicleId: number) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/hard`, { method: 'DELETE' })
            .then(res => handleResponse<ActionResponse>(res)),

    restoreVehicle: (vehicleId: number) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/restore`, { method: 'PATCH' })
            .then(res => handleResponse<Vehicle>(res)),

    updateNotify: (vehicleId: number, data: Partial<Record<string, boolean>>) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/notify`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notify_flags: data }),
        }).then(res => handleResponse<Vehicle>(res)),

    updateVehicleSizes: (vehicleId: number, data: { rims: RimSize[]; tires: TireSize[] }) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/sizes`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(res => handleResponse<Vehicle>(res)),
}
