import React, { lazy } from 'react';
import PageLoading from 'components/UI/PageLoading';

const AdminPagesIndex = lazy(() => import('.'));
const AdminPagesAll = lazy(() => import('./All'));
const AdminPagesNew = lazy(() => import('./NewPageForm'));
const AdminPagesEdit = lazy(() => import('./EditPageForm'));

export default () => ({
  // This page is only accessible via URL and was added
  // as a pragmatic solution for a mistake with the permissions
  // when the navigation page was released.
  // Some clients had access to this page before, but it got
  // removed when we released the feature-flagged navigation page.
  // Therefore it was added back.
  // https://citizenlab.atlassian.net/browse/CL-457
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
