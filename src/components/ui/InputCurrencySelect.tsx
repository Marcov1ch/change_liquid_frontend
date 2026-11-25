import { useCurrency } from '../../context/CurrencyContext';
import type { CurrencyCode } from '../../types';
import { CURRENCIES, CURRENCY_SYMBOLS } from '../../utils/currency';

interface Props {
  value: CurrencyCode;
  onChange: (value: CurrencyCode) => void;
  className?: string;
}

export function InputCurrencySelect({ value, onChange, className = '' }: Props) {
  const { currency: profileCurrency } = useCurrency();

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-label-md text-surface-on-variant">Валюта ввода</span>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as CurrencyCode)}
          className="md3-select !w-auto min-w-[9rem]"
          aria-label="Валюта ввода"
        >
          {CURRENCIES.map((code) => (
            <option key={code} value={code}>
              {code} · {CURRENCY_SYMBOLS[code]}
            </option>
          ))}
        </select>
      </div>
      {value !== profileCurrency && (
        <p className="text-body-sm text-outline m-0">
          Сумма будет пересчитана в {profileCurrency} по курсу ЦБ.
        </p>
      )}
    </div>
  );
}
