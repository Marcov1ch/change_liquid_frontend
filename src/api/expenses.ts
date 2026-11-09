import type { OtherExpense, OtherExpensePayload } from '../types'
import { API_BASE, authFetch, handleResponse, type ActionResponse } from './http'

export const expensesApi = {
    getOtherExpenses: (vehicleId: number) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/other-expenses`)
            .then(res => handleResponse<OtherExpense[]>(res)),

    createOtherExpense: (vehicleId: number, data: OtherExpensePayload) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/other-expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(res => handleResponse<OtherExpense>(res)),

    updateOtherExpense: (expenseId: number, data: Partial<OtherExpensePayload>) =>
        authFetch(`${API_BASE}/other-expenses/${expenseId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(res => handleResponse<OtherExpense>(res)),

    deleteOtherExpense: (expenseId: number) =>
        authFetch(`${API_BASE}/other-expenses/${expenseId}`, { method: 'DELETE' })
            .then(res => handleResponse<ActionResponse>(res)),
}
