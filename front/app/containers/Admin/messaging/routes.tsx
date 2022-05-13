import * as React from 'react';
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

export default () => ({
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
    },
    {
      path: 'emails/custom/new',
      element: (
        <LoadingComponent>
          <CustomEmailsNewComponent />
        </LoadingComponent>
      ),
    },
    {
      path: 'emails/custom/:campaignId/edit',
      element: (
        <LoadingComponent>
          <CustomEmailsEditComponent />
        </LoadingComponent>
      ),
    },
    {
      path: 'emails/custom/:campaignId',
      element: (
        <LoadingComponent>
          <CustomEmailsShowComponent />
        </LoadingComponent>
      ),
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
    },
    {
      path: 'texting/new',
      element: (
        <LoadingComponent>
          <NewSMSComponent />
        </LoadingComponent>
      ),
    },
    {
      path: 'texting/:campaignId/preview',
      element: (
        <LoadingComponent>
          <PreviewSMSComponent />
        </LoadingComponent>
      ),
    },
    {
      path: 'texting/:campaignId',
      element: (
        <LoadingComponent>
          <ExistingSMSComponent />
        </LoadingComponent>
      ),
    },
  ],
});
