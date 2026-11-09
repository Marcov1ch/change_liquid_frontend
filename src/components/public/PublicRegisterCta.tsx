interface Props {
    registerUrl: string;
}

export function PublicRegisterCta({ registerUrl }: Props) {
    return (
        <div className="md3-card p-6 text-center border-l-4 border-l-primary">
            <h2 className="text-title-md text-surface-on mb-2">Ведите историю своего авто</h2>
            <p className="text-body-md text-outline mb-4">
                Регистрируйтесь в ChangeLiquid, чтобы вовремя узнавать о заменах
                и хранить всю историю обслуживания в одном месте.
            </p>
            <a href={registerUrl} className="md3-btn-primary inline-flex">
                Зарегистрироваться
            </a>
        </div>
    );
}
