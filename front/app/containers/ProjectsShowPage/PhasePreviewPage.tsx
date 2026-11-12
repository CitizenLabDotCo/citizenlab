import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import ProjectCTABar from './ProjectCTABar';
import PhaseDescription from './timeline/PhaseDescription';
import PhaseParticipationContent from './timeline/PhaseParticipationContent';

interface Props {
  project: IProjectData;
  phase: IPhaseData;
}

const PhasePreviewPage = ({ project, phase }: Props) => (
  <Box
    data-cy="e2e-phase-preview-page"
    background={colors.background}
    minHeight="100vh"
    pt="20px"
    pb="140px"
  >
    <Box px="16px">
      <PhaseDescription projectId={project.id} selectedPhaseId={phase.id} />
    </Box>
    <PhaseParticipationContent
      project={project}
      phase={phase}
      wrapReportInSuspense
    />
    <ProjectCTABar projectId={project.id} />
  </Box>
);

export default PhasePreviewPage;
