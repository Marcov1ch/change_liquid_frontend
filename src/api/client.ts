import { authApi } from './auth'
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
}

export {
    ApiError,
    getAccessToken,
    getRefreshToken,
    setTokens,
    clearTokens,
} from './http'
