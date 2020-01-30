import React from 'react';

import AuthProviderImage from './AuthProviderImage';
import useTenant from 'hooks/useTenant';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  mode: 'signUp' | 'signIn';
  providerName: string;
}

const AzureAdImage = ({ mode, providerName }: Props) => {
  const tenant = useTenant();

  if (isNilOrError(tenant)) return null;

  const azureAdLogoUrl = tenant?.data?.attributes?.settings?.azure_ad_login?.logo_url;

  if (!azureAdLogoUrl) return null;

  return (
    <AuthProviderImage
      logoUrl={azureAdLogoUrl}
      logoHeight="29px"
      providerName={providerName}
      mode={mode}
    />
  );
};

export default AzureAdImage;
