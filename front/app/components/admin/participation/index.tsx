import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { useLocation, useParams } from 'react-router-dom';

import usePhases from 'api/phases/usePhases';

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
  const isDemographicsTab = pathname.includes('/demographics');

  return (
    <Box p="8px 24px 24px 24px">
      <Box background={colors.white}>
        <Box position="sticky" top="0" background={colors.white} zIndex="1">
          <NavigationTabs position="relative">
            <Tab
              label={formatMessage(messages.participantsTab)}
              url={`/admin/projects/${projectId}/audience`}
              active={isTopBarNavActive(
                basePath,
                pathname,
                `/admin/projects/${projectId}/audience`
              )}
            />
            <Tab
              label={formatMessage(messages.demographicsTab)}
              url={`/admin/projects/${projectId}/audience/demographics`}
              active={isTopBarNavActive(
                basePath,
                pathname,
                `/admin/projects/${projectId}/audience/demographics`
              )}
            />
          </NavigationTabs>
        </Box>
        <Box p={`${defaultAdminCardPadding}px`}>
          {isDemographicsTab ? (
            <Demographics
              defaultStartDate={startOfFirstPhase}
              defaultEndDate={endOfLastPhase ?? undefined}
            />
          ) : (
            <Users />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectParticipation;
