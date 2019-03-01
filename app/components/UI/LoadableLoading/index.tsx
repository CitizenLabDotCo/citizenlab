import React from 'react';
import { FullPageCenteredSpinner, FullPageCenteredSpinnerAdmin } from '../Spinner';

const LoadableLoading = (props) => {
  if (props.pastDelay) {
    return <FullPageCenteredSpinner />;
  }

  return null;
};

export const LoadableLoadingAdmin = (props) => {
  if (props.pastDelay) {
    return <FullPageCenteredSpinnerAdmin />;
  }

  return null;
};

export default LoadableLoading;
