interface Props {
    onLogout: () => void;
}

export function ProfileLogoutSection({ onLogout }: Props) {
    return (
        <div className="md3-card p-6">
            <h2 className="text-title-md text-surface-on mb-2">Сеанс</h2>
            <p className="text-body-md text-outline mb-4">Выйдите, если пользуетесь общим устройством.</p>
            <button onClick={onLogout} className="md3-btn-tonal" aria-label="Выйти из аккаунта">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Выйти
            </button>
        </div>
    );
}
