import type { CurrencyCode, CurrencyConversionPreview } from '../types'
import { API_BASE, authFetch, handleResponse } from './http'

export const currencyApi = {
    getConversionPreview: (target: CurrencyCode) =>
        authFetch(`${API_BASE}/currency/conversion-preview?target=${encodeURIComponent(target)}`)
            .then(res => handleResponse<CurrencyConversionPreview>(res)),
}
