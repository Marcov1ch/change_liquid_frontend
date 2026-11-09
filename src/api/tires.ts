import type {
    TireInstallPayload,
    TireInstallResponse,
    TireSet,
    TireSetPayload,
} from '../types'
import { API_BASE, authFetch, handleResponse, type ActionResponse } from './http'

export const tiresApi = {
    getTireSets: (vehicleId: number) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/tire-sets`)
            .then(res => handleResponse<TireSet[]>(res)),

    createTireSet: (vehicleId: number, data: TireSetPayload) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/tire-sets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(res => handleResponse<TireSet>(res)),

    updateTireSet: (tireSetId: number, data: Partial<TireSetPayload>) =>
        authFetch(`${API_BASE}/tire-sets/${tireSetId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(res => handleResponse<TireSet>(res)),

    deleteTireSet: (tireSetId: number) =>
        authFetch(`${API_BASE}/tire-sets/${tireSetId}`, { method: 'DELETE' })
            .then(res => handleResponse<ActionResponse>(res)),

    installTireSet: (vehicleId: number, tireSetId: number, data: TireInstallPayload = {}) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/tire-sets/${tireSetId}/install`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(res => handleResponse<TireInstallResponse>(res)),
}
