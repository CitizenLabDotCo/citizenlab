import React from 'react';
import Loadable from 'react-loadable';
import { LoadableLoadingCitizen } from 'components/UI/LoadableLoading';

const LoadableVerificationSuccess = Loadable({
  loading: LoadableLoadingCitizen,
  loader: () => import('./'),
  delay: false,
  render(loaded) {
    const VerificationSuccess = loaded.default;

    return <VerificationSuccess />;
  }
});

export default LoadableVerificationSuccess;
