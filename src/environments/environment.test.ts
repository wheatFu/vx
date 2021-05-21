import { Environment } from './types'

export const environment: Environment = {
  SERVER_URL: `http://10.55.8.173/api`,
  production: false,
  useHash: false,
  hmr: false,
  api: {
    tokenExpiredTime: 5 * 59 * 1000,
    refreTokenExpiredTime: 24 * 60 * 59 * 1000,
    refreshTokenEnabled: true,
    refreshTokenType: 'auth-refresh',
  },
}
