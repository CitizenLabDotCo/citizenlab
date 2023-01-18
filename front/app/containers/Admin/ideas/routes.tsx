import React, { lazy } from 'react';
import PageLoading from 'components/UI/PageLoading';

const AdminIdeasContainer = lazy(() => import('./index'));
const AdminIdeasAll = lazy(() => import('./all'));

export default () => ({
  path: 'ideas',
  element: (
    <PageLoading>
      <AdminIdeasContainer />
    </PageLoading>
  ),
  children: [
    {
      index: true,
      element: (
        <PageLoading>
          <AdminIdeasAll />
        </PageLoading>
      ),
    },
  ],
});
