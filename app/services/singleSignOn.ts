import { AUTH_PATH } from 'containers/App/constants';
import { ISignUpInMetaData } from 'components/SignUpIn';
import { stringify } from 'qs';

export type SSOProvider = 'google' | 'facebook' | 'azureactivedirectory' | 'franceconnect';

export const handleOnSSOClick = (provider: SSOProvider, metaData: ISignUpInMetaData) => {
  const { method, pathname, verification } = metaData;
  const urlSearchParams = stringify({
    sign_up_in_method: method,
    sign_up_in_pathname: pathname,
    sign_up_in_verification: verification
  });
  const fullUrl = `${AUTH_PATH}/${provider}?${urlSearchParams}`;
  window.location.href = fullUrl;
};
