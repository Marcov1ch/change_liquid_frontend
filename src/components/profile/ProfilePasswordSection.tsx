import type { FormEvent } from 'react';

interface Props {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
    passwordError: string;
    passwordSubmitting: boolean;
    passwordSuccess: boolean;
    onOldPasswordChange: (value: string) => void;
    onNewPasswordChange: (value: string) => void;
    onConfirmPasswordChange: (value: string) => void;
    onSubmit: (event: FormEvent) => void;
}

export function ProfilePasswordSection({
    oldPassword,
    newPassword,
    confirmPassword,
    passwordError,
    passwordSubmitting,
    passwordSuccess,
    onOldPasswordChange,
    onNewPasswordChange,
    onConfirmPasswordChange,
    onSubmit,
}: Props) {
    return (
        <div className="md3-card p-6">
            <h2 className="text-title-md text-surface-on mb-4">Смена пароля</h2>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <div>
                    <label htmlFor="old-password" className="block text-label-lg text-surface-on mb-1">Текущий пароль</label>
                    <input
                        id="old-password"
                        type="password"
                        value={oldPassword}
                        onChange={event => onOldPasswordChange(event.target.value)}
                        required
                        className="md3-field"
                    />
                </div>
                <div>
                    <label htmlFor="new-password" className="block text-label-lg text-surface-on mb-1">Новый пароль</label>
                    <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={event => onNewPasswordChange(event.target.value)}
                        required
                        className="md3-field"
                    />
                </div>
                <div>
                    <label htmlFor="confirm-password" className="block text-label-lg text-surface-on mb-1">Подтвердите пароль</label>
                    <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={event => onConfirmPasswordChange(event.target.value)}
                        required
                        className="md3-field"
                    />
                </div>
                {passwordError && <p className="text-body-sm text-error" role="alert">{passwordError}</p>}
                {passwordSuccess && <p className="text-body-sm text-[#1B5E1B]" role="status">Пароль изменён</p>}
                <button
                    type="submit"
                    disabled={passwordSubmitting}
                    className="md3-btn-primary self-start"
                >
                    {passwordSubmitting ? 'Сохранение...' : 'Изменить пароль'}
                </button>
            </form>
        </div>
    );
}
