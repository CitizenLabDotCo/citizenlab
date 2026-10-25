import React, { Suspense } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';
import { getPhaseActionDescriptor } from 'api/phases/utils';
import { IProjectData } from 'api/projects/types';

import ParticipationPermission from 'containers/ProjectsShowPage/shared/ParticipationPermission';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import PreviewSkeleton from 'components/admin/PhasePreview/PreviewSkeleton';
import ContentContainer from 'components/ContentContainer';
import StatusModule from 'components/StatusModule';

import { getPermissionsDisabledMessage } from 'utils/actionDescriptors';
import { pastPresentOrFuture } from 'utils/dateUtils';
import { getPhasePreview } from 'utils/phasePreview/runtime';

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
  if (getPhasePreview()?.unsaved) {
    return (
      <Box p="20px">
        <PreviewSkeleton
          kind={
            ['native_survey', 'poll', 'survey'].includes(
              phase.attributes.participation_method
            )
              ? 'form'
              : 'cards'
          }
        />
      </Box>
    );
  }

  const projectId = project.id;
  const phaseId = phase.id;
  const {
    participation_method: participationMethod,
    voting_method: votingMethod,
    survey_embed_url: surveyEmbedUrl,
    survey_service: surveyService,
    document_annotation_embed_url: documentUrl,
  } = phase.attributes;

  if (
    getPhasePreview() &&
    participationMethod === 'native_survey' &&
    !children
  ) {
    return (
      <ContentContainer maxWidth={maxPageWidth}>
        <PreviewSkeleton kind="form" />
      </ContentContainer>
    );
  }

  // Provider embeds cannot run inside the isolated preview. Show their shape
  // without loading third-party scripts or allowing provider-side submissions.
  if (
    getPhasePreview() &&
    ['survey', 'document_annotation'].includes(participationMethod)
  ) {
    const action =
      participationMethod === 'document_annotation'
        ? 'annotating_document'
        : 'taking_survey';
    const { disabled_reason } = getPhaseActionDescriptor(phase, action);
    const lifecycle = getPhasePreview()?.lifecycle;
    if (
      (lifecycle === 'before' || lifecycle === 'ended') &&
      (documentUrl || surveyEmbedUrl)
    ) {
      return (
        <ContentContainer maxWidth={maxPageWidth}>
          <ParticipationPermission
            id={
              participationMethod === 'document_annotation'
                ? 'document-annotation'
                : 'project-survey'
            }
            action={action}
            enabled={false}
            phaseId={phase.id}
            disabledReason={disabled_reason}
            disabledMessage={
              getPermissionsDisabledMessage(action, disabled_reason) ?? null
            }
          >
            <PreviewSkeleton kind="document" />
          </ParticipationPermission>
        </ContentContainer>
      );
    }

    return (
      <ContentContainer
        id={
          participationMethod === 'document_annotation'
            ? 'document-annotation'
            : 'project-survey'
        }
        maxWidth={maxPageWidth}
      >
        <PreviewSkeleton kind="document" />
      </ContentContainer>
    );
  }
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
