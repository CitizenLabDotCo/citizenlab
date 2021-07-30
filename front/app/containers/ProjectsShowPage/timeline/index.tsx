import React, { memo, useEffect, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// components
import Timeline from './Timeline';
import PhaseDescription from './PhaseDescription';
import PBExpenses from '../shared/pb/PBExpenses';
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

// services
import {
  IPhaseData,
  getLatestRelevantPhase,
  getCurrentPhase,
} from 'services/phases';

// events
import { selectedPhase$, selectPhase } from './events';

// hooks
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import useWindowSize from 'hooks/useWindowSize';
import useLocale from 'hooks/useLocale';

// i18n
import messages from 'containers/ProjectsShowPage/messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { colors, viewportWidths, isRtl } from 'utils/styleUtils';

// other
import { isValidPhase } from '../phaseParam';
import setPhaseURL from './setPhaseURL';

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

const StyledPhaseDescription = styled(PhaseDescription)<{
  hasBottmMargin: boolean;
}>`
  margin-bottom: ${(props) => (props.hasBottmMargin ? '50px' : '0px')};
`;

const StyledPBExpenses = styled(PBExpenses)`
  padding: 20px;
  margin-bottom: 50px;
`;

interface Props {
  projectId: string;
  className?: string;
}

const ProjectTimelineContainer = memo<Props & WithRouterProps>(
  ({ projectId, className, params: { phaseNumber } }) => {
    const project = useProject({ projectId });
    const phases = usePhases(projectId);
    const locale = useLocale();
    const windowSize = useWindowSize();

    const [selectedPhase, setSelectedPhase] = useState<IPhaseData | null>(null);
    const currentPhase = getCurrentPhase(phases);

    useEffect(() => {
      const subscription = selectedPhase$.subscribe((selectedPhase) => {
        setSelectedPhase(selectedPhase);
      });

      return () => {
        subscription.unsubscribe();
        selectPhase(null);
      };
    }, []);

    useEffect(() => {
      if (
        selectedPhase !== null &&
        !isNilOrError(phases) &&
        project &&
        !isNilOrError(locale)
      ) {
        setPhaseURL(
          selectedPhase.id,
          currentPhase?.id,
          phases,
          project,
          locale
        );
      }
    }, [selectedPhase, phases, project, locale]);

    useEffect(() => {
      if (!isNilOrError(phases) && phases.length > 0) {
        const latestRelevantPhase = getLatestRelevantPhase(phases);

        // if a phase parameter was provided, and it is valid, we set that as phase.
        // otherwise, use the most logical phase
        if (isValidPhase(phaseNumber, phases)) {
          const phaseIndex = Number(phaseNumber) - 1;
          selectPhase(phases[phaseIndex]);
        } else if (latestRelevantPhase) {
          selectPhase(latestRelevantPhase);
        } else {
          selectPhase(null);
        }
      }
    }, [phases]);

    if (
      !isNilOrError(project) &&
      !isNilOrError(phases) &&
      phases.length > 0 &&
      selectedPhase !== undefined
    ) {
      const selectedPhaseId = selectedPhase ? selectedPhase.id : null;
      const isPBPhase =
        selectedPhase?.attributes?.participation_method === 'budgeting';
      const participationMethod = !isNilOrError(selectedPhase)
        ? selectedPhase.attributes.participation_method
        : null;
      const smallerThanSmallTablet = windowSize
        ? windowSize.windowWidth <= viewportWidths.smallTablet
        : false;

      return (
        <Container className={`${className || ''} e2e-project-process-page`}>
          <StyledSectionContainer>
            <div>
              <ContentContainer maxWidth={maxPageWidth}>
                {smallerThanSmallTablet && (
                  <Header>
                    <StyledProjectPageSectionTitle>
                      <FormattedMessage {...messages.timeline} />
                    </StyledProjectPageSectionTitle>
                    <PhaseNavigation
                      projectId={project.id}
                      buttonStyle="white"
                    />
                  </Header>
                )}
                <StyledTimeline projectId={project.id} />
                <StyledPhaseDescription
                  projectId={project.id}
                  phaseId={selectedPhaseId}
                  hasBottmMargin={
                    selectedPhase?.attributes?.participation_method !==
                    'information'
                  }
                />
                {isPBPhase && (
                  <StyledPBExpenses
                    participationContextId={selectedPhaseId}
                    participationContextType="phase"
                    viewMode={smallerThanSmallTablet ? 'column' : 'row'}
                  />
                )}
                <PhaseSurvey projectId={project.id} phaseId={selectedPhaseId} />
              </ContentContainer>
            </div>
            <div>
              <ContentContainer maxWidth={maxPageWidth}>
                <PhasePoll projectId={project.id} phaseId={selectedPhaseId} />
                <PhaseVolunteering
                  projectId={project.id}
                  phaseId={selectedPhaseId}
                />
              </ContentContainer>
            </div>

            {(participationMethod === 'ideation' ||
              participationMethod === 'budgeting') &&
              selectedPhaseId && (
                <div>
                  <ContentContainer maxWidth={maxPageWidth}>
                    <PhaseIdeas
                      projectId={project.id}
                      phaseId={selectedPhaseId}
                    />
                  </ContentContainer>
                </div>
              )}
          </StyledSectionContainer>
        </Container>
      );
    }

    return null;
  }
);

export default withRouter(ProjectTimelineContainer);
