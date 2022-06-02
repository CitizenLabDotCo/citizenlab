import React, { lazy } from 'react';
import PageLoading from 'components/UI/PageLoading';

const AdminPagesIndex = lazy(() => import('.'));
const AdminPagesAll = lazy(() => import('./All'));
const AdminPagesNew = lazy(() => import('./NewPageForm'));
const AdminPagesEdit = lazy(() => import('./EditPageForm'));

export default () => ({
  path: 'pages',
  element: (
    <PageLoading>
      <AdminPagesIndex />
    </PageLoading>
  ),
  children: [
    {
      index: true,
      element: (
        <PageLoading>
          <AdminPagesAll />
        </PageLoading>
      ),
    },
    {
      path: 'new',
      element: (
        <PageLoading>
          <AdminPagesNew />
        </PageLoading>
      ),
    },
    {
      path: ':pageId',
      element: (
        <PageLoading>
          <AdminPagesEdit />
        </PageLoading>
      ),
    },
  ],
});
