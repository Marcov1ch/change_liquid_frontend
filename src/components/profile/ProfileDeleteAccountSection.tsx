interface Props {
    onDelete: () => void;
}

export function ProfileDeleteAccountSection({ onDelete }: Props) {
    return (
        <div className="md3-card p-6 border-l-4 border-l-error">
            <h2 className="text-title-md text-error mb-2">Удаление аккаунта</h2>
            <p className="text-body-md text-outline mb-4">Это действие необратимо.</p>
            <button onClick={onDelete} className="md3-btn-danger">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Удалить аккаунт
            </button>
        </div>
    );
}
