import { Environment } from './types'

export const environment: Environment = {
  SERVER_URL: `./`,
  production: true,
  hmr: false,
  useHash: false,
  api: {
    tokenExpiredTime: 5 * 59 * 1000,
    refreTokenExpiredTime: 24 * 60 * 59 * 1000,
    refreshTokenEnabled: true,
    refreshTokenType: 'auth-refresh',
  },
}
