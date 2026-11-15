/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import type { CurrencyCode } from '../types'
import { CURRENCY_SYMBOLS, formatMoney } from '../utils/currency'
import { useAuth } from './AuthContext'

interface CurrencyContextType {
    currency: CurrencyCode
    symbol: string
    formatMoney: (value: number | null | undefined) => string
}

const CurrencyContext = createContext<CurrencyContextType | null>(null)

export function CurrencyProvider({
    children,
    currency,
}: {
    children: ReactNode
    currency?: CurrencyCode
}) {
    const { user } = useAuth()
    const activeCurrency = currency ?? user?.currency ?? 'RUB'

    const format = useCallback(
        (value: number | null | undefined) => formatMoney(value, activeCurrency),
        [activeCurrency],
    )

    const value = useMemo(
        () => ({
            currency: activeCurrency,
            symbol: CURRENCY_SYMBOLS[activeCurrency],
            formatMoney: format,
        }),
        [activeCurrency, format],
    )

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    )
}

export function useCurrency(): CurrencyContextType {
    const ctx = useContext(CurrencyContext)
    if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
    return ctx
}
