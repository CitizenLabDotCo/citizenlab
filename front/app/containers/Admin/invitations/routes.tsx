import React, { lazy } from 'react';
import Loading from 'components/UI/Loading';

const AdminInvitationsContainer = lazy(() => import('.'));
const AdminInvitationsInvite = lazy(() => import('./invite'));
const AdminInvitationsAll = lazy(() => import('./all'));

export default () => ({
  path: 'invitations',
  element: (
    <Loading admin>
      <AdminInvitationsContainer />
    </Loading>
  ),
  children: [
    {
      index: true,
      element: (
        <Loading admin>
          <AdminInvitationsInvite />
        </Loading>
      ),
    },
    {
      path: 'all',
      element: (
        <Loading admin>
          <AdminInvitationsAll />
        </Loading>
      ),
    },
  ],
});
