import React from 'react';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';

const MessagingIndexComponent = React.lazy(() => import('.'));
const CustomEmailsIndexComponent = React.lazy(
  () => import('./CustomEmails/All')
);
const CustomEmailsNewComponent = React.lazy(() => import('./CustomEmails/New'));
const CustomEmailsEditComponent = React.lazy(
  () => import('./CustomEmails/Edit')
);
const CustomEmailsShowComponent = React.lazy(
  () => import('./CustomEmails/Show')
);
const AutomatedEmailsComponent = React.lazy(() => import('./AutomatedEmails'));
const CampaignListComponent = React.lazy(
  () => import('./texting/CampaignList')
);
const NewSMSComponent = React.lazy(() => import('./texting/NewSMSCampaign'));
const PreviewSMSComponent = React.lazy(
  () => import('./texting/SMSCampaignPreview')
);
const ExistingSMSComponent = React.lazy(
  () => import('./texting/ExistingSMSCampaign')
);

const LoadingComponent = ({ children }) => {
  return (
    <React.Suspense fallback={LoadableLoadingAdmin}>{children}</React.Suspense>
  );
};

const createAdminMessagingRoutes = () => ({
  path: 'messaging',
  element: (
    <LoadingComponent>
      <MessagingIndexComponent />
    </LoadingComponent>
  ),
  children: [
    {
      path: 'emails/custom',
      element: (
        <LoadingComponent>
          <CustomEmailsIndexComponent />
        </LoadingComponent>
      ),
      children: [
        {
          path: 'new',
          element: (
            <LoadingComponent>
              <CustomEmailsNewComponent />
            </LoadingComponent>
          ),
        },
        {
          path: ':campaignId',
          element: (
            <LoadingComponent>
              <CustomEmailsShowComponent />
            </LoadingComponent>
          ),
          children: [
            {
              path: 'edit',
              element: (
                <LoadingComponent>
                  <CustomEmailsEditComponent />
                </LoadingComponent>
              ),
            },
          ],
        },
      ],
    },
    {
      path: 'emails/automated',
      element: (
        <LoadingComponent>
          <AutomatedEmailsComponent />
        </LoadingComponent>
      ),
    },
    {
      path: 'texting',
      element: (
        <LoadingComponent>
          <CampaignListComponent />
        </LoadingComponent>
      ),
      children: [
        {
          path: 'new',
          element: (
            <LoadingComponent>
              <NewSMSComponent />
            </LoadingComponent>
          ),
        },
        {
          path: ':campaignId',
          element: (
            <LoadingComponent>
              <ExistingSMSComponent />
            </LoadingComponent>
          ),
          children: [
            {
              path: 'preview',
              element: (
                <LoadingComponent>
                  <PreviewSMSComponent />
                </LoadingComponent>
              ),
            },
          ],
        },
      ],
    },
  ],
});

export default createAdminMessagingRoutes;
