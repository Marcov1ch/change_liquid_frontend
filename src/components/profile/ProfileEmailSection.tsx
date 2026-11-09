import type { FormEvent } from 'react';
import type { User } from '../../types';

interface Props {
    user: User | null;
    email: string;
    emailError: string;
    emailSubmitting: boolean;
    emailSuccess: boolean;
    resendSubmitting: boolean;
    resendSuccess: boolean;
    resendSecondsLeft: number;
    onEmailChange: (value: string) => void;
    onSubmit: (event: FormEvent) => void;
    onResend: () => void;
}

export function ProfileEmailSection({
    user,
    email,
    emailError,
    emailSubmitting,
    emailSuccess,
    resendSubmitting,
    resendSuccess,
    resendSecondsLeft,
    onEmailChange,
    onSubmit,
    onResend,
}: Props) {
    return (
        <div className="md3-card p-6">
            <h2 className="text-title-md text-surface-on mb-4">Email</h2>
            <form onSubmit={onSubmit} className="flex flex-col gap-3">
                <input
                    type="email"
                    value={email}
                    onChange={event => onEmailChange(event.target.value)}
                    required
                    className="md3-field"
                />
                {emailError && <p className="text-body-sm text-error" role="alert">{emailError}</p>}
                {emailSuccess && (
                    <p className="text-body-sm text-[#1B5E1B]" role="status">
                        Email обновлён. Подтвердите новый адрес по ссылке из письма.
                    </p>
                )}
                <button
                    type="submit"
                    disabled={emailSubmitting}
                    className="md3-btn-primary self-start"
                >
                    {emailSubmitting ? 'Сохранение...' : 'Сохранить'}
                </button>
            </form>

            {user && !user.email_verified && (
                <div className="mt-4 pt-4 border-t border-outline-variant flex flex-col gap-2">
                    <p className="text-body-md text-outline m-0">
                        Email не подтверждён. Пока адрес не подтверждён, восстановление пароля
                        и уведомления не отправляются.
                    </p>
                    {resendSuccess && (
                        <p className="text-body-sm text-[#1B5E1B]" role="status">
                            Письмо отправлено повторно.
                        </p>
                    )}
                    <button
                        type="button"
                        onClick={onResend}
                        disabled={resendSubmitting || resendSecondsLeft > 0}
                        className="md3-btn-text self-start"
                        aria-live="polite"
                    >
                        {resendSubmitting
                            ? 'Отправка...'
                            : resendSecondsLeft > 0
                                ? `Отправить повторно через ${resendSecondsLeft} с`
                                : 'Отправить письмо повторно'}
                    </button>
                </div>
            )}
        </div>
    );
}
