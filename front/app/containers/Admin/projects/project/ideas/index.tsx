import React from 'react';

// routing
import { useParams } from 'react-router-dom';

// i18n
import messages from '../messages';
import ownMessages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import { Box, Title, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import PostManager, { TFilterMenu } from 'components/admin/PostManager';
import AnalysisBanner from './AnalysisBanner';

// hooks
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import useFeatureFlag from 'hooks/useFeatureFlag';

// styling
import { colors } from 'utils/styleUtils';

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
  const importPrintedFormsEnabled = useFeatureFlag({
    name: 'import_printed_forms',
  });
  const { projectId } = useParams() as { projectId: string };
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

  return (
    <>
      <Box mb="30px">
        <Box display="flex" flexDirection="row" justifyContent="space-between">
          <Title variant="h2" color="primary" fontWeight="normal" mt="16px">
            <FormattedMessage {...messages.titleInputManager} />
          </Title>
          {importPrintedFormsEnabled && (
            <Button
              width="auto"
              bgColor={colors.primary}
              linkTo={`/admin/projects/${projectId}/offline-inputs`}
              icon="page"
            >
              <FormattedMessage {...ownMessages.addOfflineInputs} />
            </Button>
          )}
        </Box>
        <Text color="textSecondary">
          <FormattedMessage {...messages.subtitleInputManager} />
        </Text>
      </Box>

      <AnalysisBanner />

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
