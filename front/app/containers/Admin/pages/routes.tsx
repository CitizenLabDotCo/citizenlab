import React from 'react';
import { LoadingComponent } from 'routes';

const AdminPagesIndexComponent = React.lazy(() => import('.'));
const AdminPagesAllComponent = React.lazy(() => import('./All'));
const AdminPagesNewComponent = React.lazy(() => import('./NewPageForm'));
const AdminPagesEditComponent = React.lazy(() => import('./EditPageForm'));

export default () => ({
  path: 'pages',
  element: (
    <LoadingComponent>
      <AdminPagesIndexComponent />
    </LoadingComponent>
  ),
  children: [
    {
      index: true,
      element: (
        <LoadingComponent>
          <AdminPagesAllComponent />
        </LoadingComponent>
      ),
    },
    {
      path: 'new',
      element: (
        <LoadingComponent>
          <AdminPagesNewComponent />
        </LoadingComponent>
      ),
    },
    {
      path: ':pageId',
      element: (
        <LoadingComponent>
          <AdminPagesEditComponent />
        </LoadingComponent>
      ),
    },
  ],
});
