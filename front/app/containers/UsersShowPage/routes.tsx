import React from 'react';

import { Navigate } from 'react-router-dom';

import PageLoading from 'components/UI/PageLoading';

import Following from './Following';
import Submissions from './Submissions';
import UserComments from './UserComments';
import UserEvents from './UserEvents';

import UsersShowPage from './';

export default () => ({
  path: 'profile/:userSlug',
  element: (
    <PageLoading>
      <UsersShowPage />
    </PageLoading>
  ),
  children: [
    {
      path: '',
      element: <Navigate to="submissions" replace />,
    },
    {
      path: 'submissions',
      element: <Submissions />,
    },
    {
      path: 'comments',
      element: <UserComments />,
    },
    {
      path: 'following',
      element: <Following />,
    },
    {
      path: 'events',
      element: <UserEvents />,
    },
  ],
});
