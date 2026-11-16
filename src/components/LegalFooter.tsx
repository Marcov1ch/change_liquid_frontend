import { Link } from 'react-router-dom'

export function LegalFooter() {
  return (
    <div className="mt-4 flex flex-col items-center gap-1 text-body-sm text-outline">
      <Link to="/privacy" className="text-primary hover:underline underline-offset-2">
        Политика конфиденциальности
      </Link>
      <Link to="/account-deletion" className="text-primary hover:underline underline-offset-2">
        Удаление аккаунта
      </Link>
    </div>
  )
}
