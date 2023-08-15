// Libraries
import React from 'react';
import messages from '../messages';
import { useParams } from 'react-router-dom';

// Utils
import { FormattedMessage } from 'utils/cl-intl';

// Components
import { Box, Title, Text } from '@citizenlab/cl2-component-library';
import PostManager, { TFilterMenu } from 'components/admin/PostManager';

// resources
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import AnalysisBanner from './AnalysisBanner';
import WrittenIdeasBanner from './WrittenIdeasBanner';

const defaultTimelineProjectVisibleFilterMenu = 'phases';
const defaultContinuousProjectVisibleFilterMenu = 'statuses';
const timelineProjectVisibleFilterMenus: TFilterMenu[] = [
  defaultTimelineProjectVisibleFilterMenu,
  'statuses',
  'topics',
];
const continuousProjectVisibleFilterMenus: TFilterMenu[] = [
  defaultContinuousProjectVisibleFilterMenu,
  'topics',
];

const AdminProjectIdeas = () => {
  const { projectId } = useParams() as { projectId: string };
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

  return (
    <>
      <Box mb="30px">
        <Title variant="h2" color="primary" fontWeight="normal">
          <FormattedMessage {...messages.titleInputManager} />
        </Title>
        <Text color="textSecondary">
          <FormattedMessage {...messages.subtitleInputManager} />
        </Text>
      </Box>

      <AnalysisBanner />
      <WrittenIdeasBanner />

      {project && (
        <PostManager
          type="ProjectIdeas"
          projectId={project.data.id}
          phases={phases?.data}
          visibleFilterMenus={
            project.data.attributes.process_type === 'timeline'
              ? timelineProjectVisibleFilterMenus
              : continuousProjectVisibleFilterMenus
          }
          defaultFilterMenu={
            project.data.attributes.process_type === 'timeline'
              ? defaultTimelineProjectVisibleFilterMenu
              : defaultContinuousProjectVisibleFilterMenu
          }
        />
      )}
    </>
  );
};

export default AdminProjectIdeas;
