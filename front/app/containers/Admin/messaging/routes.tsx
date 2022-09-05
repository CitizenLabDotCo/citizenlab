import React, { lazy } from 'react';
import PageLoading from 'components/UI/PageLoading';

const MessagingIndex = lazy(() => import('.'));
const CustomEmailsIndex = lazy(() => import('./CustomEmails/All'));
const CustomEmailsNew = lazy(() => import('./CustomEmails/New'));
const CustomEmailsEdit = lazy(() => import('./CustomEmails/Edit'));
const CustomEmailsShow = lazy(() => import('./CustomEmails/Show'));
const AutomatedEmails = lazy(() => import('./AutomatedEmails'));
const CampaignList = lazy(() => import('./texting/CampaignList'));
const NewSMS = lazy(() => import('./texting/NewSMSCampaign'));
const PreviewSMS = lazy(() => import('./texting/SMSCampaignPreview'));
const ExistingSMS = lazy(() => import('./texting/ExistingSMSCampaign'));

const createAdminMessagingRoutes = () => ({
  path: 'messaging',
  element: (
    <PageLoading>
      <MessagingIndex />
    </PageLoading>
  ),
  children: [
    {
      path: 'emails/custom',
      element: (
        <PageLoading>
          <CustomEmailsIndex />
        </PageLoading>
      ),
    },
    {
      path: 'emails/custom/new',
      element: (
        <PageLoading>
          <CustomEmailsNew />
        </PageLoading>
      ),
    },
    {
      path: 'emails/custom/:campaignId',
      element: (
        <PageLoading>
          <CustomEmailsShow />
        </PageLoading>
      ),
    },
    {
      path: 'emails/custom/:campaignId/edit',
      element: (
        <PageLoading>
          <CustomEmailsEdit />
        </PageLoading>
      ),
    },
    {
      path: 'emails/automated',
      element: (
        <PageLoading>
          <AutomatedEmails />
        </PageLoading>
      ),
    },
    {
      path: 'texting',
      element: (
        <PageLoading>
          <CampaignList />
        </PageLoading>
      ),
    },
    {
      path: 'texting/new',
      element: (
        <PageLoading>
          <NewSMS />
        </PageLoading>
      ),
    },
    {
      path: 'texting/:campaignId',
      element: (
        <PageLoading>
          <ExistingSMS />
        </PageLoading>
      ),
    },
    {
      path: 'texting/:campaignId/preview',
      element: (
        <PageLoading>
          <PreviewSMS />
        </PageLoading>
      ),
    },
  ],
});

export default createAdminMessagingRoutes;
