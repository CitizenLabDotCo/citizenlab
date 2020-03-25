import { AUTH_PATH } from 'containers/App/constants';
import { ISignUpInMetaData } from 'components/SignUpIn';
import { stringify } from 'qs';

export type SSOProvider = 'google' | 'facebook' | 'azureactivedirectory' | 'franceconnect';

export const handleOnSSOClick = (provider: SSOProvider, metaData: ISignUpInMetaData) => () => {
  const { action, ...metaDataWithoutAction } = metaData;
  const baseUrl = `${AUTH_PATH}/${provider}`;
  const urlSearchParams = stringify({ sign_up_in_metadata: metaDataWithoutAction });
  const fullUrl = `${baseUrl}?${urlSearchParams}`;
  window.location.href = fullUrl;
};
