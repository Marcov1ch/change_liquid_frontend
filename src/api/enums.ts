import type { ComponentConfig } from '../types'
import { API_BASE, authFetch, handleResponse } from './http'

export const enumsApi = {
    getBrands: () =>
        authFetch(`${API_BASE}/enums/brands`)
            .then(res => handleResponse<{ brands: { value: string; label: string }[] }>(res)),

    getModels: (brand: string) =>
        authFetch(`${API_BASE}/enums/models/${brand}`)
            .then(res => handleResponse<{ models: { value: string; label: string }[] }>(res)),

    getComponents: () =>
        authFetch(`${API_BASE}/enums/components`)
            .then(res => handleResponse<{ components: { value: string; label: string }[] }>(res)),

    getComponentConfigs: () =>
        authFetch(`${API_BASE}/enums/component-configs`)
            .then(res => handleResponse<{ configs: ComponentConfig[] }>(res)),
}
