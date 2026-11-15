import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { Modal } from '../Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { CurrencyCode, CurrencyConversionPreview } from '../../types';
import { CURRENCIES, formatMoney } from '../../utils/currency';

function rateText(preview: CurrencyConversionPreview): string | null {
    if (preview.to_rub_rate != null) {
        return `${formatMoney(preview.to_rub_rate, 'RUB')} за 1 ${preview.to_currency}`;
    }
    if (preview.rate != null) {
        return `1 ${preview.from_currency} = ${formatMoney(preview.rate, preview.to_currency)}`;
    }
    return null;
}

export function ProfileCurrencySection() {
    const { user, updateCurrency } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selected, setSelected] = useState<CurrencyCode>(user?.currency ?? 'RUB');
    const [preview, setPreview] = useState<CurrencyConversionPreview | null>(null);
    const [checking, setChecking] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user?.currency) setSelected(user.currency);
    }, [user?.currency]);

    const applyCurrency = async (currency: CurrencyCode) => {
        setSubmitting(true);
        try {
            const result = await updateCurrency(currency);
            const converted = result.from_currency !== result.to_currency && result.records_count > 0;
            if (converted) {
                await queryClient.invalidateQueries();
                const rate = result.rate != null
                    ? ` Курс: ${result.rate.toLocaleString('ru-RU', { maximumFractionDigits: 6 })} ${result.to_currency} за 1 ${result.from_currency}.`
                    : '';
                toast.success(`Валюта изменена. Пересчитано записей: ${result.records_count}.${rate}`);
            } else {
                toast.success('Валюта сохранена.');
            }
            setPreview(null);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Не удалось сменить валюту');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;

        if (selected === user.currency) {
            await applyCurrency(selected);
            return;
        }

        setChecking(true);
        try {
            const data = await api.getConversionPreview(selected);
            if (data.records_count === 0) {
                await applyCurrency(selected);
            } else {
                setPreview(data);
            }
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Не удалось получить курс валюты');
        } finally {
            setChecking(false);
        }
    };

    const busy = checking || submitting;
    const conversionRate = preview ? rateText(preview) : null;

    return (
        <>
            <div className="md3-card p-6">
                <h2 className="text-title-md text-surface-on mb-4">Валюта</h2>
                <div className="flex flex-col gap-3">
                    <label className="flex flex-col gap-1">
                        <span className="text-body-sm text-outline">Выберите текущую валюту</span>
                        <select
                            value={selected}
                            onChange={event => setSelected(event.target.value as CurrencyCode)}
                            className="md3-field"
                            disabled={busy}
                        >
                            {CURRENCIES.map(currency => (
                                <option key={currency} value={currency}>{currency}</option>
                            ))}
                        </select>
                    </label>
                    <p className="text-body-sm text-outline m-0">
                        Выберите валюту, в которой вы ведёте расходы. Ранее введённые
                        суммы будут переконвертированы по курсу.
                    </p>
                    <button
                        type="button"
                        onClick={() => { void handleSave(); }}
                        disabled={busy}
                        className="md3-btn-primary self-start"
                    >
                        {checking ? 'Загрузка курса...' : submitting ? 'Сохранение...' : 'Сохранить'}
                    </button>
                </div>
            </div>

            <Modal
                isOpen={preview !== null}
                onClose={() => { if (!submitting) setPreview(null); }}
                title="Смена валюты"
            >
                {preview && (
                    <div className="flex flex-col gap-4">
                        <p className="text-body-md text-surface-on m-0">
                            Все ранее введённые расходы будут переконвертированы из{' '}
                            <strong>{preview.from_currency}</strong> в{' '}
                            <strong>{preview.to_currency}</strong>
                            {conversionRate ? <> по курсу <strong>{conversionRate}</strong></> : null}.
                        </p>
                        <p className="text-body-md text-surface-on-variant m-0">
                            Будет пересчитано записей: <strong>{preview.records_count}</strong>,
                            автомобилей: <strong>{preview.vehicles_count}</strong>.
                        </p>
                        {preview.fetched_at && (
                            <p className="text-body-sm text-outline m-0">
                                Курс получен: {new Date(preview.fetched_at).toLocaleString('ru-RU')}.
                                {' '}Источник: {preview.source === 'cbr'
                                    ? 'ЦБ РФ'
                                    : preview.source === 'fallback'
                                        ? 'резервный курс'
                                        : preview.source}.
                            </p>
                        )}
                        {preview.stale && (
                            <p className="text-body-sm text-[#7A6100] m-0" role="alert">
                                Курс может быть устаревшим: ЦБ недоступен, используется
                                последний известный или резервный курс.
                            </p>
                        )}
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setPreview(null)}
                                disabled={submitting}
                                className="md3-btn-text"
                            >
                                Отмена
                            </button>
                            <button
                                type="button"
                                onClick={() => { void applyCurrency(preview.to_currency); }}
                                disabled={submitting}
                                className="md3-btn-primary"
                            >
                                {submitting ? 'Конвертация...' : 'Сменить валюту'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
