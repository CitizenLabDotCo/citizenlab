import React from 'react';

import { Box, Title, Text } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

import useFeatureFlag from 'hooks/useFeatureFlag';

import InputManager, {
  TFilterMenu,
} from 'components/admin/PostManager/InputManager';
import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import AnalysisBanner from './AnalysisBanner';
import ownMessages from './messages';
import NewIdeaButton from './NewIdeaButton';

const defaultTimelineProjectVisibleFilterMenu = 'phases';
const timelineProjectVisibleFilterMenus: TFilterMenu[] = [
  defaultTimelineProjectVisibleFilterMenu,
  'statuses',
  'topics',
];

const AdminProjectIdeas = () => {
  const inputImporterEnabled = useFeatureFlag({
    name: 'input_importer',
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
          <Title styleVariant="h3" color="primary" fontWeight="normal" my="0px">
            <FormattedMessage {...messages.titleInputManager} />
          </Title>
          <Box display="flex" gap="8px">
            {inputImporterEnabled && (
              <Button
                width="auto"
                linkTo={`/admin/projects/${projectId}/phases/${phaseId}/input-importer`}
                icon="page"
                buttonStyle="secondary"
              >
                <FormattedMessage {...ownMessages.importInputs} />
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
