import React from 'react';

import { Navigate } from 'react-router-dom';

import PageLoading from 'components/UI/PageLoading';

import Following from './Following';
import Submissions from './Submissions';
import UserComments from './UserComments';
import UserEvents from './UserEvents';

import UsersShowPage from './';

enum userShowPageRoutes {
  profile = 'profile',
  default = '',
  profileUserSlug = `profile/:userSlug`,
  submissions = 'submissions',
  comments = 'comments',
  following = 'following',
  events = 'events',
}

export type userShowPageRouteTypes =
  | `${userShowPageRoutes.profile}/${string}`
  | ``
  | `${userShowPageRoutes.profile}/${userShowPageRoutes.submissions}`
  | `${userShowPageRoutes.profile}/${userShowPageRoutes.comments}`
  | `${userShowPageRoutes.profile}/${userShowPageRoutes.following}`
  | `${userShowPageRoutes.profile}/${userShowPageRoutes.events}`;

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
      element: <Navigate to="submissions" replace />,
    },
    {
      path: userShowPageRoutes.submissions,
      element: <Submissions />,
    },
    {
      path: userShowPageRoutes.comments,
      element: <UserComments />,
    },
    {
      path: userShowPageRoutes.following,
      element: <Following />,
    },
    {
      path: userShowPageRoutes.events,
      element: <UserEvents />,
    },
  ],
});
