import React, { lazy } from 'react';

import { Navigate } from 'react-router-dom';

import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';

const MessagingIndex = lazy(() => import('.'));
const CustomEmailsIndex = lazy(() => import('./CustomEmails/All'));
const CustomEmailsNew = lazy(() => import('./CustomEmails/New'));
const CustomEmailsShow = lazy(() => import('./CustomEmails/Show'));
const AutomatedEmails = lazy(() => import('./AutomatedEmails'));
const EmailsEdit = lazy(() => import('./Edit'));

export enum messagingRoutes {
  messaging = 'messaging',
  emailsCustom = `emails/custom`,
  emailsCustomNew = `emails/custom/new`,
  emailsCustomCampaignId = 'emails/custom/:campaignId',
  emailsCustomCampaignIdEdit = 'emails/custom/:campaignId/edit',
  emailsAutomated = 'emails/automated',
  emailsAutomatedCampaignIdEdit = 'emails/automated/:campaignId/edit',
}

export type messagingRouteTypes =
  | AdminRoute<messagingRoutes.messaging>
  | AdminRoute<`${messagingRoutes.messaging}/${messagingRoutes.emailsCustom}`>
  | AdminRoute<`${messagingRoutes.messaging}/${messagingRoutes.emailsCustomNew}`>
  | AdminRoute<`${messagingRoutes.messaging}/${messagingRoutes.emailsCustom}/${string}`>
  | AdminRoute<`${messagingRoutes.messaging}/${messagingRoutes.emailsCustom}/${string}/edit`>
  | AdminRoute<`${messagingRoutes.messaging}/${messagingRoutes.emailsAutomated}`>
  | AdminRoute<`${messagingRoutes.messaging}/${messagingRoutes.emailsAutomated}/${string}/edit`>;

const createAdminMessagingRoutes = () => ({
  path: messagingRoutes.messaging,
  element: (
    <PageLoading>
      <MessagingIndex />
    </PageLoading>
  ),
  children: [
    {
      path: '',
      element: <Navigate to={messagingRoutes.emailsCustom} />,
    },
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
          <EmailsEdit campaignType="custom" />
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
    {
      path: messagingRoutes.emailsAutomatedCampaignIdEdit,
      element: (
        <PageLoading>
          <EmailsEdit campaignType="automated" />
        </PageLoading>
      ),
    },
  ],
});

export default createAdminMessagingRoutes;
