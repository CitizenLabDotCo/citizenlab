import React, { Suspense } from 'react';

import usePhases from 'api/phases/usePhases';
import { getLatestRelevantPhase } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import { isValidPhase } from 'containers/ProjectsShowPage/phaseParam';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';
import CommonGroundTabs from 'containers/ProjectsShowPage/timeline/CommonGround/CommonGroundTabs';
import PhaseIdeas from 'containers/ProjectsShowPage/timeline/Ideas';
import PhaseDocumentAnnotation from 'containers/ProjectsShowPage/timeline/PhaseDocumentAnnotation';
import PhasePoll from 'containers/ProjectsShowPage/timeline/Poll';
import PhaseSurvey from 'containers/ProjectsShowPage/timeline/Survey';
import PhaseVolunteering from 'containers/ProjectsShowPage/timeline/Volunteering';
import VotingResults from 'containers/ProjectsShowPage/timeline/VotingResults';

import ContentContainer from 'components/ContentContainer';
import StatusModule from 'components/StatusModule';

import { pastPresentOrFuture } from 'utils/dateUtils';
import { useParams } from 'utils/router';

const PhaseReport = React.lazy(
  () => import('containers/ProjectsShowPage/timeline/PhaseReport')
);

type Props = {
  projectId: string;
};

// Renders the active phase's participation content (ideas / survey / voting /
// poll / volunteering / common ground / report) for the public project page.
// Mirrors containers/ProjectsShowPage/timeline/index.tsx and must stay in sync
// with it. Rendered only on the public project route (where the phase params and
// the route-bound sub-components resolve).
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

  const selectedPhaseId = selectedPhase.id;
  const participationMethod = selectedPhase.attributes.participation_method;
  const votingMethod = selectedPhase.attributes.voting_method;
  const isPastPhase =
    !!selectedPhase.attributes.end_at &&
    pastPresentOrFuture(selectedPhase.attributes.end_at) === 'past';
  const isVotingPhase = participationMethod === 'voting';
  const showIdeas =
    participationMethod === 'ideation' ||
    participationMethod === 'proposals' ||
    (isVotingPhase && !isPastPhase) ||
    (isVotingPhase && !selectedPhase.attributes.autoshare_results_enabled);
  const showVotingResults =
    isVotingPhase &&
    isPastPhase &&
    selectedPhase.attributes.autoshare_results_enabled;
  const reportId = selectedPhase.relationships.report?.data?.id;
  const showReport =
    participationMethod === 'information' &&
    !!reportId &&
    selectedPhase.attributes.report_public;

  return (
    <>
      <ContentContainer maxWidth={maxPageWidth}>
        {isVotingPhase && (
          <StatusModule
            phase={selectedPhase}
            project={project.data}
            votingMethod={votingMethod}
          />
        )}
        <PhaseSurvey project={project.data} phaseId={selectedPhaseId} />
        {participationMethod === 'document_annotation' && (
          <PhaseDocumentAnnotation
            phase={selectedPhase}
            project={project.data}
          />
        )}
        <PhasePoll projectId={projectId} phaseId={selectedPhaseId} />
        <PhaseVolunteering projectId={projectId} phaseId={selectedPhaseId} />
        {showIdeas && (
          <PhaseIdeas projectId={projectId} phaseId={selectedPhaseId} />
        )}
        {showVotingResults && votingMethod && (
          <VotingResults
            phaseId={selectedPhaseId}
            votingMethod={votingMethod}
          />
        )}
        {participationMethod === 'common_ground' && (
          <CommonGroundTabs
            phaseId={selectedPhase.id}
            project={project.data}
            isPastPhase={isPastPhase}
          />
        )}
      </ContentContainer>
      {showReport && (
        <Suspense fallback={null}>
          <PhaseReport reportId={reportId} phaseId={selectedPhaseId} />
        </Suspense>
      )}
    </>
  );
};

export default PublicInputContent;
