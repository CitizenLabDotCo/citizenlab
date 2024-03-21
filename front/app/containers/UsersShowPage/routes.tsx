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

export type UserShowPageRouteTypes =
  | `${string}${userShowPageRoutes.profile}/${string}`
  | `${string}`
  | `${string}${userShowPageRoutes.profile}/${userShowPageRoutes.submissions}`
  | `${string}${userShowPageRoutes.profile}/${userShowPageRoutes.comments}`
  | `${string}${userShowPageRoutes.profile}/${userShowPageRoutes.following}`
  | `${string}${userShowPageRoutes.profile}/${userShowPageRoutes.events}`;

type RoutesTypes = {
  path: userShowPageRoutes;
  element: JSX.Element;
  children: {
    path: userShowPageRoutes;
    element: JSX.Element;
  }[];
};

export default (): RoutesTypes => ({
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
