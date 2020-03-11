import { AUTH_PATH } from 'containers/App/constants';
import { IAction, convertActionToUrlSearchParams } from 'components/SignUp';

export type SSOProvider = 'google' | 'facebook' | 'azureactivedirectory' | 'franceconnect';

export const handleOnSSOClick = (provider: SSOProvider, action?: IAction | null) => () => {
  const baseUrl = `${AUTH_PATH}/${provider}`;
  const url = !action ? baseUrl : `${baseUrl}${convertActionToUrlSearchParams(action)}`;
  window.location.href = url;
};
