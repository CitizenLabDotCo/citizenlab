import React, { lazy } from 'react';
import PageLoading from 'components/UI/PageLoading';

const AdminSettingsRegistration = lazy(() => import('.'));

export default () => ({
  path: 'registration',
  element: (
    <PageLoading>
      <AdminSettingsRegistration />
    </PageLoading>
  ),
});
