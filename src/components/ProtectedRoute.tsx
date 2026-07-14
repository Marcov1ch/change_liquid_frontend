import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-md-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-md-outline-variant border-t-md-primary
                                    rounded-md-full animate-spin" />
                    <p className="text-body-large text-md-on-surface-variant">Загрузка...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}
