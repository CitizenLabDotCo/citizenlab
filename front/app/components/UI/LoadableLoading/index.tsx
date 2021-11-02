import React from 'react';
import FullPageSpinner from '../FullPageSpinner';
import { LoadingComponentProps } from 'react-loadable';

export const LoadableLoadingCitizen = (props: LoadingComponentProps) => {
  if (process.env.NODE_ENV === 'development' && props.error) {
    // eslint-disable-next-line no-console
    console.log(props.error);
  }
  if (props.pastDelay) {
    return <FullPageSpinner />;
  }

  return null;
};

export const LoadableLoadingAdmin = (props: LoadingComponentProps) => {
  if (props.pastDelay) {
    return <FullPageSpinner admin={true} />;
  }

  return null;
};
