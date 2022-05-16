import React, { FC, Suspense } from 'react';
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

interface Props {
  admin?: boolean;
  // possibly add children prop and remove FC
  // https://medium.com/raccoons-group/why-you-probably-shouldnt-use-react-fc-to-type-your-react-components-37ca1243dd13
}

const Loading: FC<Props> = ({ admin = false, children }) => {
  return (
    <Suspense fallback={<FullPageSpinner admin={admin} />}>{children}</Suspense>
  );
};

export default Loading;
