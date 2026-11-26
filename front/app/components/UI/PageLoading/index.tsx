import React, { ReactNode, Suspense, useContext } from 'react';

import { isAdminRoute } from 'utils/permissions/rules/routePermissions';
import { useLocation } from 'utils/router';

import FullPageSpinner from '../FullPageSpinner';

import PageLoadingFallbackContext from './FallbackContext';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

const PageLoading = ({ children, fallback }: Props) => {
  const { pathname } = useLocation();
  const areaFallback = useContext(PageLoadingFallbackContext);
  const admin = isAdminRoute(pathname);

  return (
    <Suspense
      fallback={fallback ?? areaFallback ?? <FullPageSpinner admin={admin} />}
    >
      {children}
    </Suspense>
  );
};

export default PageLoading;
