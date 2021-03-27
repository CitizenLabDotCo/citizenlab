import React, { memo, useEffect, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isString } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import { pastPresentOrFuture } from 'utils/dateUtils';

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
  SectionContainer,
  ProjectPageSectionTitle,
  maxPageWidth,
} from 'containers/ProjectsShowPage/styles';

// services
import {
  IPhaseData,
  getCurrentPhase,
  getFirstPhase,
  getLastPhase,
  getLastPastPhase,
} from 'services/phases';

// events
import { selectedPhase$, selectPhase } from './events';

// hooks
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import useWindowSize from 'hooks/useWindowSize';

// i18n
import messages from 'containers/ProjectsShowPage/messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { colors, viewportWidths, isRtl } from 'utils/styleUtils';

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
  margin-bottom: 50px;
`;

interface Props {
  projectId: string;
  className?: string;
}

const ProjectTimelineContainer = memo<Props & WithRouterProps>(
  ({ projectId, location, className }) => {
    const project = useProject({ projectId });
    const phases = usePhases(projectId);
    const windowSize = useWindowSize();

    const [selectedPhase, setSelectedPhase] = useState<IPhaseData | null>(null);

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
        !isNilOrError(location) &&
        !isNilOrError(phases) &&
        phases.length > 0
      ) {
        const currentPhase = getCurrentPhase(phases);
        const firstPhase = getFirstPhase(phases);
        const lastPhase = getLastPhase(phases);
        const lastPastPhase = getLastPastPhase(phases);

        // if, coming from the siteMap, a phase url parameter was passed in, we pick that phase as the default phase,
        // then remove the param so that when the user navigates to other phases there is no mismatch
        if (isString(location?.query?.phase)) {
          const phase = phases.find(
            (phase) => phase.id === location.query.phase
          );

          if (phase) {
            window.history.replaceState(null, '', location.pathname);
            selectPhase(phase);
          }
        } else if (currentPhase) {
          selectPhase(currentPhase);
        } else if (
          firstPhase &&
          pastPresentOrFuture([
            firstPhase.attributes.start_at,
            firstPhase.attributes.end_at,
          ]) === 'future'
        ) {
          selectPhase(firstPhase);
        } else if (
          lastPastPhase &&
          lastPhase &&
          pastPresentOrFuture([
            lastPhase.attributes.start_at,
            lastPhase.attributes.end_at,
          ]) === 'future'
        ) {
          selectPhase(lastPastPhase);
        } else {
          selectPhase(lastPhase || null);
        }
      }
    }, [location, phases]);

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
