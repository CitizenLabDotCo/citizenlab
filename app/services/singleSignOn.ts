import { AUTH_PATH } from 'containers/App/constants';

export type SSOProvider = 'google' | 'facebook' | 'azureactivedirectory' | 'franceconnect';

export const handleOnSSOClick = (provider: SSOProvider, action?: string) => () => {
  if (!action) {
    window.location.href = `${AUTH_PATH}/${provider}`;
  } else {
    window.location.href = `${AUTH_PATH}/${provider}?action=${action}`;
  }
};
