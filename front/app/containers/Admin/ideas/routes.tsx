import React, { lazy } from 'react';
import PageLoading from 'components/UI/PageLoading';
import moduleConfiguration from 'modules';

const AdminIdeasContainer = lazy(() => import('./index'));
const AdminIdeasAll = lazy(() => import('./all'));
const Import = lazy(() => import('./import'));

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
    {
      path: 'import',
      element: (
        <PageLoading>
          <Import />
        </PageLoading>
      ),
    },
    ...moduleConfiguration.routes['admin.ideas'],
  ],
});
