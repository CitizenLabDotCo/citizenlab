import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { useLocation, useParams } from 'react-router-dom';
import { RouteType } from 'routes';
import { ITab } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import ProjectTraffic from 'containers/Admin/projects/project/traffic';

import NavigationTabs, { Tab } from 'components/admin/NavigationTabs';

import { useIntl } from 'utils/cl-intl';
import { isTopBarNavActive } from 'utils/helperUtils';
import { defaultAdminCardPadding } from 'utils/styleConstants';

import Demographics from './Demographics';
import messages from './messages';
import Users from './Users';

const ProjectParticipation = () => {
  const { projectId } = useParams() as { projectId: string };
  const { pathname } = useLocation();
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();

  const basePath = `/admin/projects/${projectId}/audience`;

  const privateAttributesInExport =
    appConfiguration?.data.attributes.settings.core
      .private_attributes_in_export;

  // Build tabs based on whether participants are visible
  const tabs: ITab[] = privateAttributesInExport
    ? [
        {
          name: 'participants',
          label: formatMessage(messages.participantsTab),
          url: `/admin/projects/${projectId}/audience` as RouteType,
        },
        {
          name: 'demographics',
          label: formatMessage(messages.demographicsTab),
          url: `/admin/projects/${projectId}/audience/demographics` as RouteType,
        },
        {
          name: 'traffic',
          label: formatMessage(messages.trafficTab),
          url: `/admin/projects/${projectId}/audience/traffic` as RouteType,
        },
      ]
    : [
        {
          name: 'demographics',
          label: formatMessage(messages.demographicsTab),
          url: `/admin/projects/${projectId}/audience` as RouteType,
        },
        {
          name: 'traffic',
          label: formatMessage(messages.trafficTab),
          url: `/admin/projects/${projectId}/audience/traffic` as RouteType,
        },
      ];

  // Find the active tab based on current pathname
  const activeTab =
    tabs.find((tab) => isTopBarNavActive(basePath, pathname, tab.url)) ||
    tabs[0];

  return (
    <Box p="8px 24px 24px 24px">
      <Box background={colors.white}>
        <Box position="sticky" top="0" background={colors.white} zIndex="1">
          <NavigationTabs position="relative">
            {tabs.map(({ url, label, name }) => (
              <Tab
                key={name}
                label={label}
                url={url}
                active={isTopBarNavActive(basePath, pathname, url)}
              />
            ))}
          </NavigationTabs>
        </Box>
        <Box p={`${defaultAdminCardPadding}px`}>
          {activeTab.name === 'participants' && <Users />}
          {activeTab.name === 'demographics' && <Demographics />}
          {activeTab.name === 'traffic' && <ProjectTraffic />}
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectParticipation;
