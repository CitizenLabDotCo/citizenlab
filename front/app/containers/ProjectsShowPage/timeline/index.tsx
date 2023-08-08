import React, { memo, useMemo } from 'react';

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
import PhaseDocumentAnnotation from './document_annotation';
import StatusModule from 'components/StatusModule';
import VotingResults from './VotingResults';

// router
import setPhaseURL from './setPhaseURL';
import { useParams } from 'react-router-dom';

// hooks
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';

// i18n
import messages from 'containers/ProjectsShowPage/messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { colors, isRtl } from 'utils/styleUtils';

// utils
import { getLatestRelevantPhase } from 'api/phases/utils';
import { isValidPhase } from '../phaseParam';

// typings
import { IPhaseData } from 'api/phases/types';
import { pastPresentOrFuture } from 'utils/dateUtils';

const Container = styled.div``;

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

const StyledTimeline = styled(Timeline)`
  margin-bottom: 22px;
`;
interface Props {
  projectId: string;
  className?: string;
}

const ProjectTimelineContainer = memo<Props>(({ projectId, className }) => {
  const { phaseNumber } = useParams();
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

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

  const selectPhase = (phase: IPhaseData) => {
    if (!phases || !project) return;
    setPhaseURL(phase.id, phases.data, project.data);
  };

  if (project && selectedPhase) {
    const selectedPhaseId = selectedPhase.id;
    const participationMethod = selectedPhase.attributes.participation_method;
    const isPastPhase =
      pastPresentOrFuture(selectedPhase.attributes.end_at) === 'past';

    const isVotingPhase = participationMethod === 'voting';

    const showIdeas =
      participationMethod === 'ideation' || (isVotingPhase && !isPastPhase);

    const showVotingResults = isVotingPhase && isPastPhase;

    return (
      <Container className={`${className || ''} e2e-project-process-page`}>
        <StyledSectionContainer>
          <div>
            <ContentContainer maxWidth={maxPageWidth}>
              <Header>
                <StyledProjectPageSectionTitle>
                  <FormattedMessage {...messages.phases} />
                </StyledProjectPageSectionTitle>
                <PhaseNavigation projectId={projectId} buttonStyle="white" />
              </Header>
              <StyledTimeline
                projectId={projectId}
                selectedPhase={selectedPhase}
                setSelectedPhase={selectPhase}
              />
              {isVotingPhase && (
                <>
                  <StatusModule
                    phase={selectedPhase}
                    project={project.data}
                    votingMethod={
                      selectedPhase?.attributes.voting_method ||
                      project?.data.attributes.voting_method
                    }
                  />
                </>
              )}
              <PhaseSurvey project={project.data} phaseId={selectedPhaseId} />
              {participationMethod === 'document_annotation' && (
                <PhaseDocumentAnnotation
                  phase={selectedPhase}
                  project={project.data}
                />
              )}
            </ContentContainer>
          </div>
          <div>
            <ContentContainer maxWidth={maxPageWidth}>
              <PhasePoll projectId={projectId} phaseId={selectedPhaseId} />
              <PhaseVolunteering
                projectId={projectId}
                phaseId={selectedPhaseId}
              />
              {showIdeas && (
                <PhaseIdeas projectId={projectId} phaseId={selectedPhaseId} />
              )}
              {showVotingResults && <VotingResults phaseId={selectedPhaseId} />}
            </ContentContainer>
          </div>
        </StyledSectionContainer>
      </Container>
    );
  }

  return null;
});

export default ProjectTimelineContainer;
