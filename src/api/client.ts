import { authApi } from './auth'
import { currencyApi } from './currency'
import { enumsApi } from './enums'
import { expensesApi } from './expenses'
import { fuelApi } from './fuel'
import { repairsApi } from './repairs'
import { replacementsApi } from './replacements'
import { shareApi } from './share'
import { tiresApi } from './tires'
import { vehiclesApi } from './vehicles'

export const api = {
    ...authApi,
    ...vehiclesApi,
    ...replacementsApi,
    ...tiresApi,
    ...expensesApi,
    ...fuelApi,
    ...repairsApi,
    ...enumsApi,
    ...shareApi,
    ...currencyApi,
}

export {
    ApiError,
    getAccessToken,
    getRefreshToken,
    setTokens,
    clearTokens,
} from './http'
