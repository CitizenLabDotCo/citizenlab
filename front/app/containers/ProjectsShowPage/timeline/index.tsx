import React, { useMemo } from 'react';

import { Box, colors, isRtl, Title } from '@citizenlab/cl2-component-library';
import { useParams } from 'utils/router';
import styled from 'styled-components';

import { IPhaseData } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import { getLatestRelevantPhase, hideTimelineUI } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import messages from 'containers/ProjectsShowPage/messages';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import ContentContainer from 'components/ContentContainer';
import SectionContainer from 'components/SectionContainer';
import StatusModule from 'components/StatusModule';

import { FormattedMessage } from 'utils/cl-intl';
import { pastPresentOrFuture } from 'utils/dateUtils';

import { isValidPhase } from '../phaseParam';

import CommonGroundTabs from './CommonGround/CommonGroundTabs';
import PhaseIdeas from './Ideas';
import PhaseDocumentAnnotation from './PhaseDocumentAnnotation';
import PhaseNavigation from './PhaseNavigation';
import PhasePoll from './Poll';
import setPhaseURL from './setPhaseURL';
import PhaseSurvey from './Survey';
import Timeline from './Timeline';
import PhaseVolunteering from './Volunteering';
import VotingResults from './VotingResults';

const PhaseReport = React.lazy(() => import('./PhaseReport'));

const StyledSectionContainer = styled(SectionContainer)`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: ${colors.background};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

interface Props {
  projectId: string;
  className?: string;
}

const ProjectTimelineContainer = ({ projectId, className }: Props) => {
  const { phaseNumber } = useParams({ strict: false }) as {
    phaseNumber?: string;
  };
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const currentLocale = useLocale();
  const phaseInsightsEnabled = useFeatureFlag({ name: 'phase_insights' });

  const selectedPhase = useMemo(() => {
    if (!phases) return;

    // if a phase parameter was provided, and it is valid, we set that as phase.
    // otherwise, use the most logical phase
    if (isValidPhase(phaseNumber, phases.data)) {
      const phaseIndex = Number(phaseNumber) - 1;
      return phases.data[phaseIndex];
    }

    return getLatestRelevantPhase(phases.data);
  }, [phaseNumber, phases]);

  if (!project) return null;

  const selectPhase = (phase: IPhaseData) => {
    if (!phases) return;
    setPhaseURL(
      phase,
      phases.data,
      project.data,
      undefined,
      phaseInsightsEnabled
    );
  };

  if (selectedPhase) {
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
      selectedPhase.attributes.participation_method === 'information' &&
      !!reportId &&
      selectedPhase.attributes.report_public;

    return (
      <StyledSectionContainer
        className={`${className || ''} e2e-project-process-page`}
      >
        <ContentContainer maxWidth={maxPageWidth}>
          {!hideTimelineUI(phases?.data, currentLocale) && (
            <>
              <Header>
                <Title variant="h2" m="0" color="tenantText">
                  <FormattedMessage {...messages.phases} />
                </Title>
                <PhaseNavigation projectId={projectId} buttonStyle="white" />
              </Header>
              <Box mb="22px">
                <Timeline
                  projectId={projectId}
                  selectedPhase={selectedPhase}
                  setSelectedPhase={selectPhase}
                />
              </Box>
            </>
          )}
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
            />
          )}
        </ContentContainer>
        {showReport && (
          <PhaseReport reportId={reportId} phaseId={selectedPhaseId} />
        )}
      </StyledSectionContainer>
    );
  }

  return null;
};

export default ProjectTimelineContainer;
