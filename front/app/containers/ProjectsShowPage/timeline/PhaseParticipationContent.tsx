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
  const {
    participation_method: participationMethod,
    voting_method: votingMethod,
    survey_embed_url: surveyEmbedUrl,
    survey_service: surveyService,
    document_annotation_embed_url: documentUrl,
  } = phase.attributes;
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
  const showSurvey =
    participationMethod === 'survey' && !!surveyEmbedUrl && !!surveyService;
  const showDocumentAnnotation =
    participationMethod === 'document_annotation' && !!documentUrl;
  const showPoll = participationMethod === 'poll';
  const showVolunteering = participationMethod === 'volunteering';
  const showCommonGround = participationMethod === 'common_ground';
  const reportId = phase.relationships.report?.data?.id;
  const showReport =
    participationMethod === 'information' &&
    !!reportId &&
    phase.attributes.report_public;

  // The report brings its own width and spacing, so it sits outside the
  // container. Skipping the container when nothing goes in it leaves no empty
  // wrapper behind, which is what lets the surrounding section collapse.
  const hasContainedContent =
    !!children ||
    isVotingPhase ||
    showSurvey ||
    showDocumentAnnotation ||
    showPoll ||
    showVolunteering ||
    showIdeas ||
    showVotingResults ||
    showCommonGround;

  if (!hasContainedContent && !showReport) return null;

  return (
    <>
      {hasContainedContent && (
        <ContentContainer maxWidth={maxPageWidth}>
          {children}
          {isVotingPhase && (
            <StatusModule
              phase={phase}
              project={project}
              votingMethod={votingMethod}
            />
          )}
          {showSurvey && (
            <PhaseSurvey
              phase={phase}
              surveyEmbedUrl={surveyEmbedUrl}
              surveyService={surveyService}
            />
          )}
          {showDocumentAnnotation && (
            <PhaseDocumentAnnotation phase={phase} documentUrl={documentUrl} />
          )}
          {showPoll && <PhasePoll projectId={projectId} phaseId={phaseId} />}
          {showVolunteering && <PhaseVolunteering phase={phase} />}
          {showIdeas && <PhaseIdeas projectId={projectId} phaseId={phaseId} />}
          {showVotingResults && votingMethod && (
            <VotingResults phaseId={phaseId} votingMethod={votingMethod} />
          )}
          {showCommonGround && (
            <CommonGroundTabs
              phase={phase}
              project={project}
              isPastPhase={isPastPhase}
            />
          )}
        </ContentContainer>
      )}
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
