import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

import { Navigate } from 'utils/router';

const UsersShowPage = lazy(() => import('./'));
const Following = lazy(() => import('./Following'));
const Submissions = lazy(() => import('./Submissions'));
const Surveys = lazy(() => import('./Surveys'));
const UserComments = lazy(() => import('./UserComments'));
const UserEvents = lazy(() => import('./UserEvents'));

enum userShowPageRoutes {
  profile = 'profile',
  default = '',
  profileUserSlug = `profile/$userSlug`,
  submissions = 'submissions',
  comments = 'comments',
  following = 'following',
  events = 'events',
  surveys = 'surveys',
}

export type userShowPageRouteTypes =
  | ``
  | `/${userShowPageRoutes.profile}/${string}`
  | `/${userShowPageRoutes.profile}/${string}/${userShowPageRoutes.submissions}`
  | `/${userShowPageRoutes.profile}/${string}/${userShowPageRoutes.surveys}`
  | `/${userShowPageRoutes.profile}/${string}/${userShowPageRoutes.comments}`
  | `/${userShowPageRoutes.profile}/${string}/${userShowPageRoutes.following}`
  | `/${userShowPageRoutes.profile}/${string}/${userShowPageRoutes.events}`;

export default () => ({
  path: userShowPageRoutes.profileUserSlug,
  element: (
    <PageLoading>
      <UsersShowPage />
    </PageLoading>
  ),
  children: [
    {
      path: userShowPageRoutes.default,
      element: <Navigate to="/submissions" replace />,
    },
    {
      path: userShowPageRoutes.submissions,
      element: (
        <PageLoading>
          <div role="tabpanel" aria-labelledby="tab-submissions" tabIndex={0}>
            <Submissions />
          </div>
        </PageLoading>
      ),
    },
    {
      path: userShowPageRoutes.surveys,
      element: (
        <PageLoading>
          <div role="tabpanel" aria-labelledby="tab-surveys" tabIndex={0}>
            <Surveys />
          </div>
        </PageLoading>
      ),
    },
    {
      path: userShowPageRoutes.comments,
      element: (
        <PageLoading>
          <div role="tabpanel" aria-labelledby="tab-comments" tabIndex={0}>
            <UserComments />
          </div>
        </PageLoading>
      ),
    },
    {
      path: userShowPageRoutes.following,
      element: (
        <PageLoading>
          <div role="tabpanel" aria-labelledby="tab-following" tabIndex={0}>
            <Following />
          </div>
        </PageLoading>
      ),
    },
    {
      path: userShowPageRoutes.events,
      element: (
        <PageLoading>
          <div role="tabpanel" aria-labelledby="tab-events" tabIndex={0}>
            <UserEvents />
          </div>
        </PageLoading>
      ),
    },
  ],
});
