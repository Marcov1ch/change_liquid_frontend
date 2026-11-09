import type { Repair, RepairPayload } from '../types'
import { API_BASE, authFetch, handleResponse, type ActionResponse } from './http'

export const repairsApi = {
    getRepairs: (vehicleId: number) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/repairs`)
            .then(res => handleResponse<Repair[]>(res)),

    createRepair: (vehicleId: number, data: RepairPayload) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/repairs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(res => handleResponse<Repair>(res)),

    updateRepair: (repairId: number, data: RepairPayload) =>
        authFetch(`${API_BASE}/repairs/${repairId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(res => handleResponse<Repair>(res)),

    deleteRepair: (repairId: number) =>
        authFetch(`${API_BASE}/repairs/${repairId}`, { method: 'DELETE' })
            .then(res => handleResponse<ActionResponse>(res)),
}
