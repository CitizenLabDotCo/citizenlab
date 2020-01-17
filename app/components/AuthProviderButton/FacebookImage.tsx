import React from 'react';

import facebookLogo from 'components/AuthProviderButton/svg/facebook.svg';
import AuthProviderImage from './AuthProviderImage';

interface Props {
  mode: 'signUp' | 'signIn';
  providerName: string;
}

const FacebookImage = ({ providerName, mode }: Props) => (
  <AuthProviderImage
    logoUrl={facebookLogo}
    logoHeight="21px"
    providerName={providerName}
    mode={mode}
  />
);

export default FacebookImage;
