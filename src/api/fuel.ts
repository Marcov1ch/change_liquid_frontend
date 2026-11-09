import type { FuelRecord, FuelRecordPayload } from '../types'
import { API_BASE, authFetch, handleResponse, type ActionResponse } from './http'

export const fuelApi = {
    getFuelRecords: (vehicleId: number) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/fuel-records`)
            .then(res => handleResponse<FuelRecord[]>(res)),

    createFuelRecord: (vehicleId: number, data: FuelRecordPayload) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/fuel-records`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(res => handleResponse<FuelRecord>(res)),

    updateFuelRecord: (recordId: number, data: Partial<FuelRecordPayload>) =>
        authFetch(`${API_BASE}/fuel-records/${recordId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(res => handleResponse<FuelRecord>(res)),

    deleteFuelRecord: (recordId: number) =>
        authFetch(`${API_BASE}/fuel-records/${recordId}`, { method: 'DELETE' })
            .then(res => handleResponse<ActionResponse>(res)),
}
