import type { ComponentConfig, PublicVehicle, ShareLink } from '../types'
import { API_BASE, authFetch, handleResponse } from './http'

export const shareApi = {
    getShareLink: (vehicleId: number) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/share`)
            .then(res => handleResponse<ShareLink>(res)),

    enableShareLink: (vehicleId: number) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/share`, { method: 'POST' })
            .then(res => handleResponse<ShareLink>(res)),

    rotateShareLink: (vehicleId: number) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/share/rotate`, { method: 'POST' })
            .then(res => handleResponse<ShareLink>(res)),

    disableShareLink: (vehicleId: number) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/share`, { method: 'DELETE' })
            .then(res => handleResponse<ShareLink>(res)),

    getPublicVehicle: (token: string) =>
        fetch(`${API_BASE}/public/vehicles/${encodeURIComponent(token)}`)
            .then(res => handleResponse<PublicVehicle>(res)),

    getPublicComponentConfigs: () =>
        fetch(`${API_BASE}/enums/component-configs`)
            .then(res => handleResponse<{ configs: ComponentConfig[] }>(res)),
}
