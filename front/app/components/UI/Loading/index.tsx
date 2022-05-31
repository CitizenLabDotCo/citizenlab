import React, { FC, Suspense } from 'react';
import FullPageSpinner from '../FullPageSpinner';

interface Props {
  // If we're in the admin, the loader will take into account
  // the admin navbar's width.
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
