import { AUTH_PATH } from 'containers/App/constants';

export type SSOProvider = 'google' | 'facebook' | 'azureactivedirectory' | 'franceconnect';

export const handleOnSSOClick = (provider: SSOProvider) => () => {
  window.location.href = `${AUTH_PATH}/${provider}`;
};
