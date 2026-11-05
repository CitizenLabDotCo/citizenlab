import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

import { createRoute } from 'utils/router';

import { adminRoute } from '../routes';

const AdminInvitationsContainer = lazy(() => import('.'));
const AdminInvitationsInvite = lazy(() => import('./invite'));
const AdminInvitationsAll = lazy(() => import('./all'));

const invitationsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'users/invitations',
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
  path: 'all',
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
