import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

import { createRoute } from 'utils/router';

import { adminRoute, AdminRoute } from '../routes';

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

const invitationsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: invitationRoutes.invitations,
  component: () => (
    <PageLoading>
      <AdminInvitationsContainer />
    </PageLoading>
  ),
});

const invitationsIndexRoute = createRoute({
  getParentRoute: () => invitationsRoute,
  path: '/',
  component: () => (
    <PageLoading>
      <AdminInvitationsInvite />
    </PageLoading>
  ),
});

const invitationsAllRoute = createRoute({
  getParentRoute: () => invitationsRoute,
  path: invitationRoutes.all,
  component: () => (
    <PageLoading>
      <AdminInvitationsAll />
    </PageLoading>
  ),
});

const createAdminInvitationsRoutes = () => {
  return invitationsRoute.addChildren([
    invitationsIndexRoute,
    invitationsAllRoute,
  ]);
};

export default createAdminInvitationsRoutes;
