import { AUTH_PATH } from 'containers/App/constants';
import { ISignUpInMetaData } from 'components/SignUpIn';
import { stringify, parse } from 'qs';

export type SSOProvider = 'google' | 'facebook' | 'azureactivedirectory' | 'franceconnect';

export function getSignUpInMetaDataFromUrlSearchParams(searchParams: string) {
  const object = parse(searchParams, { ignoreQueryPrefix: true });

  if (object?.sign_up_in_meta_data) {
    const { verification } = object.sign_up_in_meta_data;

    const metaData: ISignUpInMetaData = {
      ...object.sign_up_in_meta_data,
      verification: verification === 'true'
    };

    return metaData;
  }

  return;
}

function convertSignUpInMetaDataToUrlSearchParams(metaData: ISignUpInMetaData) {
  const { action, ...metaDataWithoutAction } = metaData;
  return stringify({ sign_up_in_meta_data: metaDataWithoutAction }, { addQueryPrefix: true });
}

export const handleOnSSOClick = (provider: SSOProvider, metaData: ISignUpInMetaData) => () => {
  const baseUrl = `${AUTH_PATH}/${provider}`;
  const url = `${baseUrl}${convertSignUpInMetaDataToUrlSearchParams(metaData)}`;
  window.location.href = url;
};
