import { useMemo, useState } from 'react';
import type {
  PublicFuelRecord,
  PublicOtherExpense,
  PublicRepair,
  PublicReplacement,
} from '../types';
import { buildVehicleStatistics } from '../utils/statistics';

interface Props {
  replacements: PublicReplacement[];
  repairs: PublicRepair[];
  fuelRecords: PublicFuelRecord[];
  otherExpenses: PublicOtherExpense[];
}

const MONTH_NAMES = [
  'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
  'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек',
];

const MONTH_NAMES_FULL = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

function formatMoney(value: number): string {
  return `${value.toLocaleString()} ₽`;
}

export function StatisticsPanel({
  replacements,
  repairs,
  fuelRecords,
  otherExpenses,
}: Props) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const stats = useMemo(
    () => buildVehicleStatistics(replacements, repairs, fuelRecords, otherExpenses, year),
    [replacements, repairs, fuelRecords, otherExpenses, year],
  );

  const yearOptions = useMemo(
    () => Array.from(new Set([year, ...stats.available_years])).sort((a, b) => b - a),
    [year, stats.available_years],
  );
  const hasData = stats.totals.total > 0;
  const maxTotal = stats.max_monthly_total;

  const summary = [
    { label: 'Замены', value: stats.totals.replacements },
    { label: 'Ремонт', value: stats.totals.repairs },
    { label: 'Заправки', value: stats.totals.fuel },
    { label: 'Прочие траты', value: stats.totals.other_expenses },
    { label: 'Общие расходы', value: stats.totals.total },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-title-md text-surface-on m-0">Статистика по месяцам</h2>
        <label className="flex items-center gap-2 text-label-lg text-surface-on-variant">
          Год
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="md3-select !w-auto"
          >
            {yearOptions.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {summary.map(item => (
          <div key={item.label} className="bg-surface-variant/40 rounded-md3-sm p-3">
            <p className="text-body-sm text-outline m-0">{item.label}</p>
            <p className="text-title-md text-surface-on m-0">{formatMoney(item.value)}</p>
          </div>
        ))}
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center">
            <span className="text-xl">📊</span>
          </div>
          <p className="text-title-sm text-surface-on mb-1">За {year} год расходов нет</p>
          <p className="text-body-md text-outline max-w-sm">
            Добавьте замены, заправки, ремонты или прочие траты — статистика появится автоматически.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-surface-variant/30 rounded-md3-sm p-4">
            <div className="flex items-end gap-1 h-44">
              {stats.months.map(month => {
                const percent = maxTotal > 0 ? (month.total / maxTotal) * 100 : 0;
                return (
                  <div key={month.month} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                    <div className="w-full flex items-end h-32">
                      <div
                        className={`w-full rounded-t ${month.total > 0 ? 'bg-primary' : 'bg-outline-variant'}`}
                        style={{ height: month.total > 0 ? `${Math.max(percent, 2)}%` : '2px' }}
                        title={`${MONTH_NAMES_FULL[month.month - 1]}: ${formatMoney(month.total)}`}
                      />
                    </div>
                    <span className="text-[10px] text-outline truncate w-full text-center">
                      {MONTH_NAMES[month.month - 1]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-body-sm min-w-[560px]">
              <thead>
                <tr className="text-outline border-b border-outline-variant">
                  <th className="text-left font-normal py-2 pr-3">Месяц</th>
                  <th className="text-right font-normal py-2 px-2">Замены</th>
                  <th className="text-right font-normal py-2 px-2">Ремонт</th>
                  <th className="text-right font-normal py-2 px-2">Заправки</th>
                  <th className="text-right font-normal py-2 px-2">Прочие</th>
                  <th className="text-right font-normal py-2 pl-2">Итого</th>
                </tr>
              </thead>
              <tbody>
                {stats.months.map(month => (
                  <tr key={month.month} className="border-b border-outline-variant/50">
                    <td className="py-2 pr-3 text-surface-on">{MONTH_NAMES_FULL[month.month - 1]}</td>
                    <td className="py-2 px-2 text-right text-surface-on-variant">{formatMoney(month.replacements)}</td>
                    <td className="py-2 px-2 text-right text-surface-on-variant">{formatMoney(month.repairs)}</td>
                    <td className="py-2 px-2 text-right text-surface-on-variant">{formatMoney(month.fuel)}</td>
                    <td className="py-2 px-2 text-right text-surface-on-variant">{formatMoney(month.other_expenses)}</td>
                    <td className="py-2 pl-2 text-right text-surface-on font-semibold">{formatMoney(month.total)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 pr-3 text-surface-on font-semibold">Итого за год</td>
                  <td className="py-2 px-2 text-right text-surface-on font-semibold">{formatMoney(stats.totals.replacements)}</td>
                  <td className="py-2 px-2 text-right text-surface-on font-semibold">{formatMoney(stats.totals.repairs)}</td>
                  <td className="py-2 px-2 text-right text-surface-on font-semibold">{formatMoney(stats.totals.fuel)}</td>
                  <td className="py-2 px-2 text-right text-surface-on font-semibold">{formatMoney(stats.totals.other_expenses)}</td>
                  <td className="py-2 pl-2 text-right text-primary font-semibold">{formatMoney(stats.totals.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
