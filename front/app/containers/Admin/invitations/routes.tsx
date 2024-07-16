import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';

const AdminInvitationsContainer = lazy(() => import('.'));
const AdminInvitationsInvite = lazy(() => import('./invite'));
const AdminInvitationsAll = lazy(() => import('./all'));

export enum invitationRoutes {
  invitations = 'users/invitations',
  all = 'all',
}

export type invitationRouteTypes =
  | AdminRoute<invitationRoutes.invitations>
  | AdminRoute<`${invitationRoutes.invitations}/${invitationRoutes.all}`>;

export default () => ({
  path: invitationRoutes.invitations,
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
      path: invitationRoutes.all,
      element: (
        <PageLoading>
          <AdminInvitationsAll />
        </PageLoading>
      ),
    },
  ],
});
