import React, { Suspense } from 'react';

import { isAdminRoute } from 'utils/permissions/rules/routePermissions';
import { useLocation } from 'utils/router';

import FullPageSpinner from '../FullPageSpinner';

interface Props {
  children: React.ReactNode;
}

const PageLoading = ({ children }: Props) => {
  const { pathname } = useLocation();
  const admin = isAdminRoute(pathname);
  return (
    <Suspense fallback={<FullPageSpinner admin={admin} />}>{children}</Suspense>
  );
};

export default PageLoading;
