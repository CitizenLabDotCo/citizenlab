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
import InputManager, {
  TFilterMenu,
} from 'components/admin/PostManager/InputManager';
import AnalysisBanner from './AnalysisBanner';
import NewIdeaButton from './NewIdeaButton';

// hooks
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import usePhase from 'api/phases/usePhase';
import useFeatureFlag from 'hooks/useFeatureFlag';

const defaultTimelineProjectVisibleFilterMenu = 'phases';
const timelineProjectVisibleFilterMenus: TFilterMenu[] = [
  defaultTimelineProjectVisibleFilterMenu,
  'statuses',
  'topics',
];

const AdminProjectIdeas = () => {
  const importPrintedFormsEnabled = useFeatureFlag({
    name: 'import_printed_forms',
  });
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const { data: phase } = usePhase(phaseId);

  if (!project) return null;

  return (
    <>
      <AnalysisBanner />
      <Box mb="30px">
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Title variant="h3" color="primary" fontWeight="normal" my="0px">
            <FormattedMessage {...messages.titleInputManager} />
          </Title>
          <Box display="flex" gap="8px">
            {importPrintedFormsEnabled && (
              <Button
                width="auto"
                linkTo={`/admin/projects/${projectId}/offline-inputs/${phaseId}`}
                icon="page"
                buttonStyle="secondary"
              >
                <FormattedMessage {...ownMessages.addOfflineInputs} />
              </Button>
            )}
            {phase && (
              <NewIdeaButton
                inputTerm={phase.data.attributes.input_term}
                linkTo={`/projects/${project.data.attributes.slug}/ideas/new?phase_id=${phaseId}`}
              />
            )}
          </Box>
        </Box>
        <Text color="textSecondary">
          <FormattedMessage {...messages.subtitleInputManager} />
        </Text>
      </Box>

      {project && (
        <InputManager
          projectId={project.data.id}
          phases={phases?.data}
          phaseId={phaseId}
          visibleFilterMenus={timelineProjectVisibleFilterMenus}
          defaultFilterMenu={defaultTimelineProjectVisibleFilterMenu}
        />
      )}
    </>
  );
};

export default AdminProjectIdeas;
