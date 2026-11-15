import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { CurrencyProvider } from './context/CurrencyContext'
import { ToastProvider } from './context/ToastContext'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            retry: 1,
        },
    },
})

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider queryClient={queryClient}>
                <CurrencyProvider>
                    <ToastProvider>
                        <App />
                    </ToastProvider>
                </CurrencyProvider>
            </AuthProvider>
        </QueryClientProvider>
    </StrictMode>,
)
