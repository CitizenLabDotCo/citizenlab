import React, { Suspense } from 'react';
import FullPageSpinner from '../FullPageSpinner';

interface Props {
  // If we're in the admin, the loader will take into account
  // the admin navbar's width.
  admin?: boolean;
  children: React.ReactNode;
}

const Loading = ({ admin = false, children }: Props) => {
  return (
    <Suspense fallback={<FullPageSpinner admin={admin} />}>{children}</Suspense>
  );
};

export default Loading;
