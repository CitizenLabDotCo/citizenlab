import React from 'react';

import googleLogo from 'components/AuthProviderButton/svg/google.svg';
import AuthProviderImage from './AuthProviderImage';

interface Props {
  mode: 'signUp' | 'signIn';
  providerName: string;
}

const GoogleImage = ({ providerName, mode }: Props) => (
  <AuthProviderImage
    logoUrl={googleLogo}
    logoHeight="29px"
    providerName={providerName}
    mode={mode}
  />
);

export default GoogleImage;
