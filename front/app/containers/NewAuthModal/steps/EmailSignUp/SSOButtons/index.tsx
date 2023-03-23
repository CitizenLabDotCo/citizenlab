import React from 'react';

// components
import SSOButton from './SSOButton';

const SSOButtons = () => {
  return (
    <>
      <SSOButton ssoProvider="google" />
      <SSOButton ssoProvider="facebook" />
    </>
  );
};

export default SSOButtons;
