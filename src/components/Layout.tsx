import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export function Layout({ children }: { children: React.ReactNode }) {
    const { user, logout, isAuthenticated } = useAuth()
    const navigate = useNavigate()

    return (
        <div className="min-h-screen flex flex-col bg-md-background">
            <header className="bg-md-primary shadow-md-2 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                    <Link
                        to={isAuthenticated ? '/' : '/login'}
                        className="text-md-on-primary no-underline"
                    >
                        <span className="text-title-medium tracking-wide">Change Liquid</span>
                    </Link>
                    {isAuthenticated && user && (
                        <div className="flex items-center gap-1">
                            <span className="text-md-on-primary text-body-medium mr-2 hidden sm:inline">
                                {user.username}
                            </span>
                            <button
                                onClick={() => navigate('/profile')}
                                className="inline-flex items-center justify-center px-3 h-9 rounded-md-full
                                           text-label-large text-md-primary bg-md-on-primary
                                           transition-all duration-md-2 hover:shadow-md-1
                                           active:scale-95"
                            >
                                Профиль
                            </button>
                            <button
                                onClick={() => { logout(); navigate('/login'); }}
                                className="inline-flex items-center justify-center px-3 h-9 rounded-md-full
                                           text-label-large text-md-on-primary
                                           transition-all duration-md-2 hover:bg-white/20
                                           active:scale-95"
                            >
                                Выйти
                            </button>
                        </div>
                    )}
                </div>
            </header>
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-5">
                {children}
            </main>
        </div>
    )
}
