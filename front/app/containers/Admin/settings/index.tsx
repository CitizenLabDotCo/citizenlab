import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { Outlet as RouterOutlet, useLocation } from 'react-router-dom';
import { ITab } from 'typings';

import useFeatureFlag from 'hooks/useFeatureFlag';

import NavigationTabs, {
  Tab,
  TabsPageLayout,
} from 'components/admin/NavigationTabs';
import HelmetIntl from 'components/HelmetIntl';

import { useIntl } from 'utils/cl-intl';
import { isTopBarNavActive } from 'utils/helperUtils';
import { defaultAdminCardPadding } from 'utils/styleConstants';

import messages from './messages';

const SettingsPage = () => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const projectReviewEnabled = useFeatureFlag({ name: 'project_review' });

  const tabs: ITab[] = [
    {
      name: 'general',
      label: formatMessage(messages.tabSettings),
      url: '/admin/settings/general',
    },
    {
      name: 'branding',
      label: formatMessage(messages.tabBranding),
      url: '/admin/settings/branding',
    },
    {
      name: 'registration',
      label: formatMessage(messages.tabRegistration),
      url: '/admin/settings/registration',
    },
    {
      label: formatMessage(messages.tabTopics),
      name: 'topics',
      url: '/admin/settings/topics',
    },
    {
      name: 'areas',
      label: formatMessage(messages.tabAreas),
      url: '/admin/settings/areas',
    },
    {
      name: 'statuses',
      label: formatMessage(messages.tabInputStatuses),
      url: '/admin/settings/ideation/statuses',
    },
    {
      name: 'proposal-statuses',
      label: formatMessage(messages.tabProposalStatuses),
      url: '/admin/settings/proposals/statuses',
    },

    ...(projectReviewEnabled
      ? [
          {
            name: 'project-review',
            label: formatMessage(messages.tabApproval),
            url: '/admin/settings/review',
          } as ITab,
        ]
      : []),

    {
      name: 'policies',
      label: formatMessage(messages.tabPolicies),
      url: '/admin/settings/policies',
    },
  ];

  return (
    <>
      <HelmetIntl
        title={messages.helmetTitle}
        description={messages.helmetDescription}
      />
      <NavigationTabs>
        {tabs.map(({ url, label }) => (
          <Tab
            label={label}
            url={url}
            key={url}
            active={isTopBarNavActive('/admin/settings', pathname, url)}
          />
        ))}
      </NavigationTabs>
      <TabsPageLayout>
        <Box
          id="e2e-settings-container"
          background={colors.white}
          p={`${defaultAdminCardPadding}px`}
        >
          <RouterOutlet />
        </Box>
      </TabsPageLayout>
    </>
  );
};

export default SettingsPage;
