import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';

const MessagingIndex = lazy(() => import('.'));
const CustomEmailsIndex = lazy(() => import('./CustomEmails/All'));
const CustomEmailsNew = lazy(() => import('./CustomEmails/New'));
const CustomEmailsEdit = lazy(() => import('./CustomEmails/Edit'));
const CustomEmailsShow = lazy(() => import('./CustomEmails/Show'));
const AutomatedEmails = lazy(() => import('./AutomatedEmails'));

export enum messagingRoutes {
  messaging = 'messaging',
  emailsCustom = `emails/custom`,
  emailsCustomNew = `emails/custom/new`,
  emailsCustomCampaignId = 'emails/custom/:campaignId',
  emailsCustomCampaignIdEdit = 'emails/custom/:campaignId/edit',
  emailsAutomated = 'emails/automated',
}

export type messagingRouteTypes =
  | AdminRoute<messagingRoutes.messaging>
  | AdminRoute<`${messagingRoutes.messaging}/${messagingRoutes.emailsCustom}`>
  | AdminRoute<`${messagingRoutes.messaging}/${messagingRoutes.emailsCustomNew}`>
  | AdminRoute<`${messagingRoutes.messaging}/${messagingRoutes.emailsCustom}/${string}`>
  | AdminRoute<`${messagingRoutes.messaging}/${messagingRoutes.emailsCustom}/${string}/edit`>
  | AdminRoute<`${messagingRoutes.messaging}/${messagingRoutes.emailsAutomated}`>;

const createAdminMessagingRoutes = () => ({
  path: messagingRoutes.messaging,
  element: (
    <PageLoading>
      <MessagingIndex />
    </PageLoading>
  ),
  children: [
    {
      path: messagingRoutes.emailsCustom,
      element: (
        <PageLoading>
          <CustomEmailsIndex />
        </PageLoading>
      ),
    },
    {
      path: messagingRoutes.emailsCustomNew,
      element: (
        <PageLoading>
          <CustomEmailsNew />
        </PageLoading>
      ),
    },
    {
      path: messagingRoutes.emailsCustomCampaignId,
      element: (
        <PageLoading>
          <CustomEmailsShow />
        </PageLoading>
      ),
    },
    {
      path: messagingRoutes.emailsCustomCampaignIdEdit,
      element: (
        <PageLoading>
          <CustomEmailsEdit />
        </PageLoading>
      ),
    },
    {
      path: messagingRoutes.emailsAutomated,
      element: (
        <PageLoading>
          <AutomatedEmails />
        </PageLoading>
      ),
    },
  ],
});

export default createAdminMessagingRoutes;
