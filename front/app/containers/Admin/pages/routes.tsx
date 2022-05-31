import React, { lazy } from 'react';
import Loading from 'components/UI/Loading';

const AdminPagesIndex = lazy(() => import('.'));
const AdminPagesAll = lazy(() => import('./All'));
const AdminPagesNew = lazy(() => import('./NewPageForm'));
const AdminPagesEdit = lazy(() => import('./EditPageForm'));

export default () => ({
  path: 'pages',
  element: (
    <Loading admin>
      <AdminPagesIndex />
    </Loading>
  ),
  children: [
    {
      index: true,
      element: (
        <Loading admin>
          <AdminPagesAll />
        </Loading>
      ),
    },
    {
      path: 'new',
      element: (
        <Loading admin>
          <AdminPagesNew />
        </Loading>
      ),
    },
    {
      path: ':pageId',
      element: (
        <Loading admin>
          <AdminPagesEdit />
        </Loading>
      ),
    },
  ],
});
