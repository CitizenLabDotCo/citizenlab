import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import {
  Outlet as RouterOutlet,
  useLocation,
  useParams,
} from 'react-router-dom';
import { ITab } from 'typings';

import NavigationTabs, { Tab } from 'components/admin/NavigationTabs';

import { useIntl } from 'utils/cl-intl';
import { isTopBarNavActive } from 'utils/helperUtils';
import { defaultAdminCardPadding } from 'utils/styleConstants';

import messages from './messages';

const AdminPhaseInsights = () => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const tabs: ITab[] = [
    {
      label: formatMessage(messages.overviewTab),
      name: 'overview',
      url: `/admin/projects/${projectId}/phases/${phaseId}/insights` as const,
    },
    {
      label: formatMessage(messages.reportTab),
      name: 'report',
      url: `/admin/projects/${projectId}/phases/${phaseId}/insights/report` as const,
    },
  ];

  return (
    <Box>
      <Box position="sticky" top="0" background={colors.white} zIndex="1">
        <NavigationTabs position="relative">
          {tabs.map(({ url, label }) => (
            <Tab
              label={label}
              url={url}
              key={url}
              active={isTopBarNavActive(
                `/admin/projects/${projectId}/phases/${phaseId}/insights`,
                pathname,
                url
              )}
            />
          ))}
        </NavigationTabs>
      </Box>
      <Box p={`${defaultAdminCardPadding}px`}>
        <RouterOutlet />
      </Box>
    </Box>
  );
};

export default AdminPhaseInsights;
