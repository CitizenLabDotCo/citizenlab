import React, { lazy } from 'react';
import PageLoading from 'components/UI/PageLoading';

const MessagingIndex = lazy(() => import('.'));
const AutomatedEmails = lazy(() => import('./AutomatedEmails'));

const createAdminMessagingRoutes = () => ({
  path: 'messaging',
  element: (
    <PageLoading>
      <MessagingIndex />
    </PageLoading>
  ),
  children: [
    {
      path: 'emails/automated',
      element: (
        <PageLoading>
          <AutomatedEmails />
        </PageLoading>
      ),
    },
  ],
});

export default createAdminMessagingRoutes;
