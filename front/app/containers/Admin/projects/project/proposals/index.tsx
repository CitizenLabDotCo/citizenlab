import React from 'react';

import { Box, Title, Text } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import ProjectProposalsManager from 'components/admin/PostManager/ProjectProposalsManager';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import AnalysisBanner from '../../components/AnalysisBanner';
import NewIdeaButton from '../../components/NewIdeaButton';
import messages from '../messages';

type TFilterMenu = 'topics' | 'statuses';

const defaultTimelineProjectVisibleFilterMenu = 'statuses';
const timelineProjectVisibleFilterMenus: TFilterMenu[] = [
  defaultTimelineProjectVisibleFilterMenu,
  'topics',
];

const AdminProjectProposals = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);

  if (!project) return null;

  return (
    <>
      <AnalysisBanner phaseId={phaseId} projectId={projectId} scope="phase" />
      <Box mb="30px">
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Title variant="h3" color="primary" my="0px">
            <FormattedMessage {...messages.titleInputManager} />
          </Title>
          <Box display="flex" gap="8px">
            <ButtonWithLink
              width="auto"
              linkTo={`/admin/projects/${projectId}/phases/${phaseId}/input-importer`}
              icon="page"
              buttonStyle="secondary-outlined"
            >
              <FormattedMessage {...messages.importInputs} />
            </ButtonWithLink>
            {phase && (
              <NewIdeaButton
                inputTerm={phase.data.attributes.input_term}
                linkTo={`/projects/${project.data.attributes.slug}/ideas/new?phase_id=${phaseId}`}
              />
            )}
          </Box>
        </Box>
        <Text color="textSecondary">
          <FormattedMessage {...messages.subtitleInputProjectProposals} />
        </Text>
      </Box>
      <ProjectProposalsManager
        key={phaseId}
        projectId={project.data.id}
        phaseId={phaseId}
        visibleFilterMenus={timelineProjectVisibleFilterMenus}
        defaultFilterMenu={defaultTimelineProjectVisibleFilterMenu}
      />
    </>
  );
};

export default AdminProjectProposals;
