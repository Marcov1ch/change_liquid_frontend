/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
    id: number
    message: string
    type: ToastType
}

interface ToastContextType {
    toast: {
        success: (message: string) => void
        error: (message: string) => void
        info: (message: string) => void
    }
}

const ToastContext = createContext<ToastContextType | null>(null)

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = nextId++
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 3500)
    }, [])

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const toast = {
        success: (message: string) => addToast(message, 'success'),
        error: (message: string) => addToast(message, 'error'),
        info: (message: string) => addToast(message, 'info'),
    }

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => (
                    <ToastItem key={t.id} toast={t} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
    const bgMap: Record<ToastType, string> = {
        success: 'bg-[#1B5E1B]',
        error: 'bg-error',
        info: 'bg-surface-on-variant',
    }
    const iconMap: Record<ToastType, string> = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
    }

    return (
        <div
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-md3-md shadow-md3-3 text-white text-label-md animate-slide-in-right ${bgMap[toast.type]}`}
            role="alert"
        >
            <span className="text-lg font-bold leading-none">{iconMap[toast.type]}</span>
            <span className="flex-1">{toast.message}</span>
            <button
                onClick={() => onRemove(toast.id)}
                className="flex items-center justify-center w-6 h-6 rounded-md3-full hover:bg-white/20 transition-colors text-sm leading-none"
                aria-label="Закрыть"
            >
                ✕
            </button>
        </div>
    )
}

export function useToast(): ToastContextType {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast must be used within ToastProvider')
    return ctx
}
