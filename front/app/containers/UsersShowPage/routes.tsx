import React, { lazy } from 'react';

import { localeRoute } from 'routes';

import PageLoading from 'components/UI/PageLoading';

import { createRoute, Navigate } from 'utils/router';

const UsersShowPage = lazy(() => import('./'));
const Following = lazy(() => import('./Following'));
const Submissions = lazy(() => import('./Submissions'));
const Surveys = lazy(() => import('./Surveys'));
const UserComments = lazy(() => import('./UserComments'));
const UserEvents = lazy(() => import('./UserEvents'));

export enum userShowPageRoutes {
  profileUserSlug = 'profile/$userSlug',
  submissions = 'submissions',
  comments = 'comments',
  following = 'following',
  events = 'events',
  surveys = 'surveys',
}

export type userShowPageRouteTypes =
  | `profile/${string}`
  | `profile/${string}/${userShowPageRoutes.submissions}`
  | `profile/${string}/${userShowPageRoutes.surveys}`
  | `profile/${string}/${userShowPageRoutes.comments}`
  | `profile/${string}/${userShowPageRoutes.following}`
  | `profile/${string}/${userShowPageRoutes.events}`;

// Factory function to create routes with parent
export const createUserShowPageRoutes = () => {
  const profileRoute = createRoute({
    getParentRoute: () => localeRoute,
    path: userShowPageRoutes.profileUserSlug,
    component: () => (
      <PageLoading>
        <UsersShowPage />
      </PageLoading>
    ),
  });

  const profileIndexRoute = createRoute({
    getParentRoute: () => profileRoute,
    path: '/',
    component: () => <Navigate to="submissions" replace />,
  });

  const submissionsRoute = createRoute({
    getParentRoute: () => profileRoute,
    path: userShowPageRoutes.submissions,
    component: () => (
      <PageLoading>
        <div role="tabpanel" aria-labelledby="tab-submissions" tabIndex={0}>
          <Submissions />
        </div>
      </PageLoading>
    ),
  });

  const surveysRoute = createRoute({
    getParentRoute: () => profileRoute,
    path: userShowPageRoutes.surveys,
    component: () => (
      <PageLoading>
        <div role="tabpanel" aria-labelledby="tab-surveys" tabIndex={0}>
          <Surveys />
        </div>
      </PageLoading>
    ),
  });

  const commentsRoute = createRoute({
    getParentRoute: () => profileRoute,
    path: userShowPageRoutes.comments,
    component: () => (
      <PageLoading>
        <div role="tabpanel" aria-labelledby="tab-comments" tabIndex={0}>
          <UserComments />
        </div>
      </PageLoading>
    ),
  });

  const followingRoute = createRoute({
    getParentRoute: () => profileRoute,
    path: userShowPageRoutes.following,
    component: () => (
      <PageLoading>
        <div role="tabpanel" aria-labelledby="tab-following" tabIndex={0}>
          <Following />
        </div>
      </PageLoading>
    ),
  });

  const eventsRoute = createRoute({
    getParentRoute: () => profileRoute,
    path: userShowPageRoutes.events,
    component: () => (
      <PageLoading>
        <div role="tabpanel" aria-labelledby="tab-events" tabIndex={0}>
          <UserEvents />
        </div>
      </PageLoading>
    ),
  });

  return profileRoute.addChildren([
    profileIndexRoute,
    submissionsRoute,
    surveysRoute,
    commentsRoute,
    followingRoute,
    eventsRoute,
  ]);
};
