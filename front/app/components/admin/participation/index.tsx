import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { useLocation, useParams } from 'react-router-dom';
import { RouteType } from 'routes';
import { ITab } from 'typings';

import usePhases from 'api/phases/usePhases';

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
  const { data: phases } = usePhases(projectId);

  const startOfFirstPhase = phases?.data[0]?.attributes.start_at;
  const endOfLastPhase =
    phases?.data[phases.data.length - 1]?.attributes.end_at;

  if (!phases) return null;

  const basePath = `/admin/projects/${projectId}/audience`;

  const tabs: ITab[] = [
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
  ];

  // Content components mapping
  const contentComponents = {
    participants: Users,
    demographics: Demographics,
    traffic: ProjectTraffic,
  };

  // Content props mapping
  const contentProps = {
    participants: {},
    demographics: {
      defaultStartDate: startOfFirstPhase,
      defaultEndDate: endOfLastPhase ?? undefined,
    },
    traffic: {},
  };

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
          {React.createElement(
            contentComponents[activeTab.name as keyof typeof contentComponents],
            contentProps[activeTab.name as keyof typeof contentProps]
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectParticipation;
