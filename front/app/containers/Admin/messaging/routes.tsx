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
    <Loading>
      <MessagingIndex />
    </Loading>
  ),
  children: [
    {
      path: 'emails/custom',
      element: (
        <Loading>
          <CustomEmailsIndex />
        </Loading>
      ),
      children: [
        {
          path: 'new',
          element: (
            <Loading>
              <CustomEmailsNew />
            </Loading>
          ),
        },
        {
          path: ':campaignId',
          element: (
            <Loading>
              <CustomEmailsShow />
            </Loading>
          ),
          children: [
            {
              path: 'edit',
              element: (
                <Loading>
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
        <Loading>
          <AutomatedEmails />
        </Loading>
      ),
    },
    {
      path: 'texting',
      element: (
        <Loading>
          <CampaignList />
        </Loading>
      ),
      children: [
        {
          path: 'new',
          element: (
            <Loading>
              <NewSMS />
            </Loading>
          ),
        },
        {
          path: ':campaignId',
          element: (
            <Loading>
              <ExistingSMS />
            </Loading>
          ),
          children: [
            {
              path: 'preview',
              element: (
                <Loading>
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
