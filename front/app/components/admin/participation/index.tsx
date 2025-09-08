import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { useLocation, useParams } from 'react-router-dom';

import usePhases from 'api/phases/usePhases';

import NavigationTabs, {
  Tab,
  TabsPageLayout,
} from 'components/admin/NavigationTabs';

import { useIntl } from 'utils/cl-intl';
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

  const isDemographicsTab = pathname.includes('/demographics');

  return (
    <>
      <NavigationTabs position="relative">
        <Tab
          label={formatMessage(messages.usersTab)}
          url={`/admin/projects/${projectId}/participation`}
          active={!isDemographicsTab}
        />
        <Tab
          label={formatMessage(messages.demographicsTab)}
          url={`/admin/projects/${projectId}/participation/demographics`}
          active={isDemographicsTab}
        />
      </NavigationTabs>

      <TabsPageLayout paddingTop={42}>
        <Box background={colors.white} p={`${defaultAdminCardPadding}px`}>
          {isDemographicsTab ? (
            <Demographics
              defaultStartDate={startOfFirstPhase}
              defaultEndDate={endOfLastPhase ?? undefined}
            />
          ) : (
            <Users />
          )}
        </Box>
      </TabsPageLayout>
    </>
  );
};

export default ProjectParticipation;
