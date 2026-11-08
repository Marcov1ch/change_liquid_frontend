import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function HomeHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-sm border-b border-outline-variant shadow-md3-1">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A6DFF" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <h1 className="text-title-md text-surface-on m-0">ChangeLiquid</h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-body-md text-outline">
            <span className="sm:hidden font-bold">{user?.username?.[0]?.toUpperCase()}</span>
            <span className="hidden sm:inline">{user?.username}</span>
          </span>
          <button
            onClick={() => navigate('/profile')}
            className="md3-btn-tonal !py-2 !px-4 !rounded-md3-sm text-label-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            <span className="hidden sm:inline">Профиль</span>
          </button>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="md3-btn-text !py-2 !px-4 !rounded-md3-sm text-label-sm text-outline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
