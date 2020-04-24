import { AUTH_PATH } from 'containers/App/constants';
import { ISignUpInMetaData } from 'components/SignUpIn';
import { stringify } from 'qs';

export type SSOProvider = 'google' | 'facebook' | 'azureactivedirectory' | 'franceconnect';

export const handleOnSSOClick = (provider: SSOProvider, metaData: ISignUpInMetaData) => {
  const { flow, pathname, verification } = metaData;
  const urlSearchParams = stringify({
    sign_up_in_flow: flow,
    sign_up_in_pathname: pathname,
    sign_up_in_verification: verification
  });
  window.location.href = `${AUTH_PATH}/${provider}?${urlSearchParams}`;;
};
