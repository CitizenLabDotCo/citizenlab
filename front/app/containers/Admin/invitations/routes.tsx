import PageLoading from 'components/UI/PageLoading';
import React, { lazy } from 'react';

const AdminInvitationsContainer = lazy(() => import('.'));
const AdminInvitationsInvite = lazy(() => import('./invite'));
const AdminInvitationsAll = lazy(() => import('./all'));

export default () => ({
  path: 'invitations',
  element: (
    <PageLoading>
      <AdminInvitationsContainer />
    </PageLoading>
  ),
  children: [
    {
      index: true,
      element: (
        <PageLoading>
          <AdminInvitationsInvite />
        </PageLoading>
      ),
    },
    {
      path: 'all',
      element: (
        <PageLoading>
          <AdminInvitationsAll />
        </PageLoading>
      ),
    },
  ],
});
