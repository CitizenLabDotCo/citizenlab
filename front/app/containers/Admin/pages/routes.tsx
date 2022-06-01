import React, { lazy } from 'react';
import Loading from 'components/UI/Loading';

const AdminPagesIndex = lazy(() => import('.'));
const AdminPagesAll = lazy(() => import('./All'));
const AdminPagesNew = lazy(() => import('./NewPageForm'));
const AdminPagesEdit = lazy(() => import('./EditPageForm'));

export default () => ({
  path: 'pages',
  element: (
    <Loading>
      <AdminPagesIndex />
    </Loading>
  ),
  children: [
    {
      index: true,
      element: (
        <Loading>
          <AdminPagesAll />
        </Loading>
      ),
    },
    {
      path: 'new',
      element: (
        <Loading>
          <AdminPagesNew />
        </Loading>
      ),
    },
    {
      path: ':pageId',
      element: (
        <Loading>
          <AdminPagesEdit />
        </Loading>
      ),
    },
  ],
});
