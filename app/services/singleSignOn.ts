import { AUTH_PATH } from 'containers/App/constants';
import { IAction } from 'containers/SignUpPage';
import { stringify } from 'qs';

export type SSOProvider = 'google' | 'facebook' | 'azureactivedirectory' | 'franceconnect';

export const handleOnSSOClick = (provider: SSOProvider, action?: IAction | null) => () => {
  const baseUrl = `${AUTH_PATH}/${provider}`;
  const url = !action ? baseUrl : `${baseUrl}?${stringify(action)}`;
  window.location.href = url;
};
