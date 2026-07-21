import React from 'react';

import usePhases from 'api/phases/usePhases';
import { getLatestRelevantPhase } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import { isValidPhase } from 'containers/ProjectsShowPage/phaseParam';
import PhaseParticipationContent from 'containers/ProjectsShowPage/timeline/PhaseParticipationContent';

import { useParams } from 'utils/router';

type Props = {
  projectId: string;
};

const PublicInputContent = ({ projectId }: Props) => {
  const { phaseNumber } = useParams({ strict: false }) as {
    phaseNumber?: string;
  };
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

  if (!project || !phases) {
    return null;
  }

  const selectedPhase = isValidPhase(phaseNumber, phases.data)
    ? phases.data[Number(phaseNumber) - 1]
    : getLatestRelevantPhase(phases.data);

  if (!selectedPhase) {
    return null;
  }

  return (
    <PhaseParticipationContent
      project={project.data}
      phase={selectedPhase}
      wrapReportInSuspense
    />
  );
};

export default PublicInputContent;
