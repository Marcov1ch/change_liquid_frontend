import type { Replacement } from '../types'
import { API_BASE, authFetch, handleResponse, type ActionResponse } from './http'

export const replacementsApi = {
    getReplacements: (vehicleId: number) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/replacements`)
            .then(res => handleResponse<Replacement[]>(res)),

    createReplacement: (vehicleId: number, data: Record<string, string | number | null>) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/replacements/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ replacements: [data] }),
        }).then(res => handleResponse<Replacement[]>(res)),

    updateReplacement: (replacementId: number, data: Record<string, string | number | undefined>) =>
        authFetch(`${API_BASE}/replacements/${replacementId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(res => handleResponse<Replacement>(res)),

    deleteReplacement: (replacementId: number) =>
        authFetch(`${API_BASE}/replacements/${replacementId}`, { method: 'DELETE' })
            .then(res => handleResponse<ActionResponse>(res)),
}
