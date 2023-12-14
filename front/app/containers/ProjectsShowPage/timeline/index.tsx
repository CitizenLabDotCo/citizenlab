import React, { useMemo } from 'react';

// components
import Timeline from './Timeline';
import PhaseSurvey from './Survey';
import PhasePoll from './Poll';
import PhaseVolunteering from './Volunteering';
import PhaseIdeas from './Ideas';
import ContentContainer from 'components/ContentContainer';
import PhaseNavigation from './PhaseNavigation';
import {
  ProjectPageSectionTitle,
  maxPageWidth,
} from 'containers/ProjectsShowPage/styles';
import SectionContainer from 'components/SectionContainer';
import PhaseDocumentAnnotation from './PhaseDocumentAnnotation';
import StatusModule from 'components/StatusModule';
import VotingResults from './VotingResults';
import PhaseReport from './PhaseReport';
import { Box, colors, isRtl } from '@citizenlab/cl2-component-library';

// router
import setPhaseURL from './setPhaseURL';
import { useParams } from 'react-router-dom';

// hooks
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import useLocale from 'hooks/useLocale';

// i18n
import messages from 'containers/ProjectsShowPage/messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';

// utils
import { getLatestRelevantPhase, hideTimelineUI } from 'api/phases/utils';
import { isValidPhase } from '../phaseParam';

// typings
import { IPhaseData } from 'api/phases/types';
import { pastPresentOrFuture } from 'utils/dateUtils';

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

const StyledProjectPageSectionTitle = styled(ProjectPageSectionTitle)`
  margin: 0px;
  padding: 0px;
`;

interface Props {
  projectId: string;
  className?: string;
}

const ProjectTimelineContainer = ({ projectId, className }: Props) => {
  const { phaseNumber } = useParams();
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const currentLocale = useLocale();

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
    setPhaseURL(phase, phases.data, project.data);
  };

  if (selectedPhase) {
    const selectedPhaseId = selectedPhase.id;
    const participationMethod = selectedPhase.attributes.participation_method;
    const isPastPhase =
      !!selectedPhase.attributes.end_at &&
      pastPresentOrFuture(selectedPhase.attributes.end_at) === 'past';
    const isVotingPhase = participationMethod === 'voting';
    const showIdeas =
      participationMethod === 'ideation' || (isVotingPhase && !isPastPhase);
    const showVotingResults = isVotingPhase && isPastPhase;

    const reportId = selectedPhase.relationships.report?.data?.id;
    const showReport =
      selectedPhase.attributes.participation_method === 'information' &&
      !!reportId;

    return (
      <StyledSectionContainer
        className={`${className || ''} e2e-project-process-page`}
      >
        <ContentContainer maxWidth={maxPageWidth}>
          {!hideTimelineUI(phases?.data, currentLocale) && (
            <>
              <Header>
                <StyledProjectPageSectionTitle>
                  <FormattedMessage {...messages.phases} />
                </StyledProjectPageSectionTitle>
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
              votingMethod={selectedPhase?.attributes.voting_method}
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
          {showVotingResults && <VotingResults phaseId={selectedPhaseId} />}
        </ContentContainer>
        {showReport && <PhaseReport reportId={reportId} />}
      </StyledSectionContainer>
    );
  }

  return null;
};

export default ProjectTimelineContainer;
