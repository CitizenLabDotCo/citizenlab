import React from 'react';
import { Navigate } from 'react-router-dom';
import PageLoading from 'components/UI/PageLoading';
import UserComments from './UserComments';
import Following from './Following';
import UserEvents from './UserEvents';
import Submissions from './Submissions';
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
      element: <Navigate to="submissions" />,
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
