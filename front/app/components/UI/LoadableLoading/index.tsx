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

// since we're using React.Lazy now, the
export const LoadableLoadingAdmin = (props: LoadingComponentProps) => {
  console.log({ props });
  return <FullPageSpinner admin={true} />;
};
