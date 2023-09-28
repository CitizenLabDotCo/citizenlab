import React, { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { isAdminRoute } from 'utils/permissions/rules/routePermissions';
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
