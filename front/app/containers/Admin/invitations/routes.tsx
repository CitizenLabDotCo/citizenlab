import React from 'react';
import LoadingComponent from 'components/UI/Loading';

const AdminInvitationsContainerComponent = React.lazy(() => import('.'));
const AdminInvitationsInviteComponent = React.lazy(() => import('./invite'));
const AdminInvitationsAllComponent = React.lazy(() => import('./all'));

export default () => ({
  path: 'invitations',
  element: (
    <LoadingComponent>
      <AdminInvitationsContainerComponent />
    </LoadingComponent>
  ),
  children: [
    {
      index: true,
      element: (
        <LoadingComponent>
          <AdminInvitationsInviteComponent />
        </LoadingComponent>
      ),
    },
    {
      path: 'all',
      element: (
        <LoadingComponent>
          <AdminInvitationsAllComponent />
        </LoadingComponent>
      ),
    },
  ],
});
