import React, { lazy } from 'react';
import Loading from 'components/UI/Loading';

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
    <Loading admin>
      <MessagingIndex />
    </Loading>
  ),
  children: [
    {
      path: 'emails/custom',
      element: (
        <Loading admin>
          <CustomEmailsIndex />
        </Loading>
      ),
      children: [
        {
          path: 'new',
          element: (
            <Loading admin>
              <CustomEmailsNew />
            </Loading>
          ),
        },
        {
          path: ':campaignId',
          element: (
            <Loading admin>
              <CustomEmailsShow />
            </Loading>
          ),
          children: [
            {
              path: 'edit',
              element: (
                <Loading admin>
                  <CustomEmailsEdit />
                </Loading>
              ),
            },
          ],
        },
      ],
    },
    {
      path: 'emails/automated',
      element: (
        <Loading admin>
          <AutomatedEmails />
        </Loading>
      ),
    },
    {
      path: 'texting',
      element: (
        <Loading admin>
          <CampaignList />
        </Loading>
      ),
      children: [
        {
          path: 'new',
          element: (
            <Loading admin>
              <NewSMS />
            </Loading>
          ),
        },
        {
          path: ':campaignId',
          element: (
            <Loading admin>
              <ExistingSMS />
            </Loading>
          ),
          children: [
            {
              path: 'preview',
              element: (
                <Loading admin>
                  <PreviewSMS />
                </Loading>
              ),
            },
          ],
        },
      ],
    },
  ],
});

export default createAdminMessagingRoutes;
