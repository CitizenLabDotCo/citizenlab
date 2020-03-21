import { AUTH_PATH } from 'containers/App/constants';
import { ISignUpInAction, convertActionToUrlSearchParams } from 'components/SignUpIn';

export type SSOProvider = 'google' | 'facebook' | 'azureactivedirectory' | 'franceconnect';

export const handleOnSSOClick = (provider: SSOProvider, action?: ISignUpInAction | null) => () => {
  const baseUrl = `${AUTH_PATH}/${provider}`;
  const url = !action ? baseUrl : `${baseUrl}${convertActionToUrlSearchParams(action)}`;
  window.location.href = url;
};
