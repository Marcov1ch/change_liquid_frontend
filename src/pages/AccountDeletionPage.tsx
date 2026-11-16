import { Link } from 'react-router-dom'
import { LegalPage, LegalSection } from '../components/LegalPage'

const CONTACT_EMAIL = 'notice@change-liquid.ru'

export function AccountDeletionPage() {
  return (
    <LegalPage title="Удаление аккаунта" updatedAt="16 ноября 2026 г.">
      <p>
        Вы можете удалить аккаунт ChangeLiquid. При удалении через приложение аккаунт
        деактивируется, а полное удаление связанных данных выполняется по запросу.
        Восстановить аккаунт после деактивации нельзя.
      </p>

      <LegalSection title="Как удалить аккаунт в приложении">
        <ol className="list-decimal pl-5 flex flex-col gap-2">
          <li>Войдите в свой аккаунт.</li>
          <li>Откройте раздел «Профиль».</li>
          <li>Нажмите «Удалить аккаунт» и подтвердите действие.</li>
        </ol>
        <p className="text-outline">
          Инструкция одинакова для веб-версии и Android-приложения.
        </p>
      </LegalSection>

      <LegalSection title="Как запросить полное удаление данных">
        <p>
          После деактивации отправьте с зарегистрированного email запрос на{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline underline-offset-2">
            {CONTACT_EMAIL}
          </a>{' '}
          с темой «Удаление аккаунта». Мы можем попросить подтвердить, что аккаунт
          принадлежит вам. После подтверждения данные будут удалены.
        </p>
      </LegalSection>

      <LegalSection title="Если нет доступа к аккаунту">
        <p>
          Напишите с адреса электронной почты, указанного в аккаунте, на{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline underline-offset-2">
            {CONTACT_EMAIL}
          </a>{' '}
          с темой «Удаление аккаунта». Мы можем попросить подтвердить, что аккаунт
          принадлежит вам. После подтверждения аккаунт будет деактивирован, а связанные
          с ним данные удалены.
        </p>
      </LegalSection>

      <LegalSection title="Какие данные удаляются при полном удалении">
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>учётные данные: имя пользователя, email, хеш пароля;</li>
          <li>автомобили, госномера, пробег и интервалы замен;</li>
          <li>записи о заменах, заправках, ремонтах, расходах и комплектах шин;</li>
          <li>настройки уведомлений, валюты и профиля;</li>
          <li>публичные ссылки на историю обслуживания автомобилей;</li>
          <li>локально сохранённое состояние незавершённой поездки.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Что может сохраниться">
        <p>
          Отдельные технические журналы и записи о безопасности могут сохраняться
          ограниченное время, если это необходимо для предотвращения злоупотреблений,
          диагностики или требуется по закону. Такие данные не используются для
          предоставления вам Сервиса.
        </p>
      </LegalSection>

      <LegalSection title="Сроки">
        <p>
          При удалении через приложение аккаунт деактивируется сразу. Полное удаление
          данных выполняется после того, как мы убедимся, что запрос поступил от
          владельца аккаунта.
        </p>
      </LegalSection>

      <LegalSection title="Подробнее">
        <p>
          Как мы обрабатываем и защищаем данные — в{' '}
          <Link to="/privacy" className="text-primary hover:underline underline-offset-2">
            Политике конфиденциальности
          </Link>.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
