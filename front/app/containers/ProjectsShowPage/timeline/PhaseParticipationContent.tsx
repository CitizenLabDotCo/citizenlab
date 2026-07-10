import React, { Suspense } from 'react';

import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import ContentContainer from 'components/ContentContainer';
import StatusModule from 'components/StatusModule';

import { pastPresentOrFuture } from 'utils/dateUtils';

import CommonGroundTabs from './CommonGround/CommonGroundTabs';
import PhaseIdeas from './Ideas';
import PhaseDocumentAnnotation from './PhaseDocumentAnnotation';
import PhasePoll from './Poll';
import PhaseSurvey from './Survey';
import PhaseVolunteering from './Volunteering';
import VotingResults from './VotingResults';

const PhaseReport = React.lazy(() => import('./PhaseReport'));

interface Props {
  project: IProjectData;
  phase: IPhaseData;
  children?: React.ReactNode;
  wrapReportInSuspense?: boolean;
}

const PhaseParticipationContent = ({
  project,
  phase,
  children,
  wrapReportInSuspense = false,
}: Props) => {
  const projectId = project.id;
  const phaseId = phase.id;
  const participationMethod = phase.attributes.participation_method;
  const votingMethod = phase.attributes.voting_method;
  const isPastPhase =
    !!phase.attributes.end_at &&
    pastPresentOrFuture(phase.attributes.end_at) === 'past';
  const isVotingPhase = participationMethod === 'voting';
  const showIdeas =
    participationMethod === 'ideation' ||
    participationMethod === 'proposals' ||
    (isVotingPhase && !isPastPhase) ||
    (isVotingPhase && !phase.attributes.autoshare_results_enabled);
  const showVotingResults =
    isVotingPhase && isPastPhase && phase.attributes.autoshare_results_enabled;
  const reportId = phase.relationships.report?.data?.id;
  const showReport =
    participationMethod === 'information' &&
    !!reportId &&
    phase.attributes.report_public;

  return (
    <>
      <ContentContainer maxWidth={maxPageWidth}>
        {children}
        {isVotingPhase && (
          <StatusModule
            phase={phase}
            project={project}
            votingMethod={votingMethod}
          />
        )}
        <PhaseSurvey project={project} phaseId={phaseId} />
        {participationMethod === 'document_annotation' && (
          <PhaseDocumentAnnotation phase={phase} project={project} />
        )}
        <PhasePoll projectId={projectId} phaseId={phaseId} />
        <PhaseVolunteering projectId={projectId} phaseId={phaseId} />
        {showIdeas && <PhaseIdeas projectId={projectId} phaseId={phaseId} />}
        {showVotingResults && votingMethod && (
          <VotingResults phaseId={phaseId} votingMethod={votingMethod} />
        )}
        {participationMethod === 'common_ground' && (
          <CommonGroundTabs
            phaseId={phaseId}
            project={project}
            isPastPhase={isPastPhase}
          />
        )}
      </ContentContainer>
      {showReport &&
        (wrapReportInSuspense ? (
          <Suspense fallback={null}>
            <PhaseReport reportId={reportId} phaseId={phaseId} />
          </Suspense>
        ) : (
          <PhaseReport reportId={reportId} phaseId={phaseId} />
        ))}
    </>
  );
};

export default PhaseParticipationContent;
