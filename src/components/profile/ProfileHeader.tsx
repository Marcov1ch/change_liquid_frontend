interface Props {
    onBack: () => void;
}

export function ProfileHeader({ onBack }: Props) {
    return (
        <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-sm border-b border-outline-variant shadow-md3-1">
            <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="flex items-center justify-center w-10 h-10 rounded-md3-full text-surface-on-variant hover:bg-surface-variant transition-colors"
                    aria-label="Назад"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                </button>
                <h1 className="text-title-md text-surface-on m-0">Профиль</h1>
            </div>
        </header>
    );
}
