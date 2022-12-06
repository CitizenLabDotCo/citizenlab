import React, { memo, useEffect, useState } from 'react';
// style
import styled from 'styled-components';
import { useWindowSize } from '@citizenlab/cl2-component-library';
import useLocale from 'hooks/useLocale';
import usePhases from 'hooks/usePhases';
// hooks
import useProject from 'hooks/useProject';
// services
import {
  IPhaseData,
  getLatestRelevantPhase,
  getCurrentPhase,
} from 'services/phases';
// events
import { selectedPhase$, selectPhase } from './events';
import { FormattedMessage } from 'utils/cl-intl';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { isNilOrError } from 'utils/helperUtils';
import { colors, viewportWidths, isRtl } from 'utils/styleUtils';
// i18n
import messages from 'containers/ProjectsShowPage/messages';
import {
  ProjectPageSectionTitle,
  maxPageWidth,
} from 'containers/ProjectsShowPage/styles';
import ContentContainer from 'components/ContentContainer';
import SectionContainer from 'components/SectionContainer';
// other
import { isValidPhase } from '../phaseParam';
import PBExpenses from '../shared/pb/PBExpenses';
import PhaseIdeas from './Ideas';
import PhaseNavigation from './PhaseNavigation';
import PhasePoll from './Poll';
import PhaseSurvey from './Survey';
// components
import Timeline from './Timeline';
import PhaseVolunteering from './Volunteering';
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phases]);

    const handleSetSelectedPhase = (phase: IPhaseData) => {
      setSelectedPhase(phase);
    };

    if (
      !isNilOrError(project) &&
      !isNilOrError(phases) &&
      phases.length > 0 &&
      selectedPhase
    ) {
      const selectedPhaseId = selectedPhase.id;
      const isPBPhase =
        selectedPhase.attributes.participation_method === 'budgeting';
      const participationMethod = selectedPhase.attributes.participation_method;
      const smallerThanSmallTablet = windowSize
        ? windowSize.windowWidth <= viewportWidths.tablet
        : false;

      return (
        <Container className={`${className || ''} e2e-project-process-page`}>
          <StyledSectionContainer>
            <div>
              <ContentContainer maxWidth={maxPageWidth}>
                <Header>
                  <StyledProjectPageSectionTitle>
                    <FormattedMessage {...messages.phases} />
                  </StyledProjectPageSectionTitle>
                  <PhaseNavigation projectId={project.id} buttonStyle="white" />
                </Header>
                <StyledTimeline
                  projectId={project.id}
                  selectedPhase={selectedPhase}
                  setSelectedPhase={handleSetSelectedPhase}
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
