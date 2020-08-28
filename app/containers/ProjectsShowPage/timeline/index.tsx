import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { Subscription } from 'rxjs';
import { isNilOrError } from 'utils/helperUtils';

// components
import Timeline, { selectedPhase$ } from './Timeline';
import PhaseAbout from './PhaseAbout';
import PBExpenses from '../pb/PBExpenses';
import PhaseSurvey from './PhaseSurvey';
import PhasePoll from './PhasePoll';
import PhaseVolunteering from './PhaseVolunteering';
import PhaseIdeas from './PhaseIdeas';
import EventsPreview from '../EventsPreview_old_unused';
import ProjectArchivedIndicator from 'components/ProjectArchivedIndicator';
import ContentContainer from 'components/ContentContainer';

// services
import { IPhaseData } from 'services/phases';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// style
import styled from 'styled-components';
import { colors, viewportWidths } from 'utils/styleUtils';
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: ${colors.background};
`;

const FirstRow = styled.div``;

const StyledTimeline = styled(Timeline)``;

const StyledProjectArchivedIndicator = styled(ProjectArchivedIndicator)`
  padding-bottom: 30px;
`;

const SecondRow = styled.div``;

const StyledPhaseAbout = styled(PhaseAbout)``;

const SecondRowContentContainer = styled(ContentContainer)``;

const StyledPBExpenses = styled(PBExpenses)``;

const StyledPhaseSurvey = styled(PhaseSurvey)``;

const StyledPhasePoll = styled(PhasePoll)``;

const StyledPhaseVolunteering = styled(PhaseVolunteering)``;

const StyledPhaseIdeas = styled(PhaseIdeas)``;

interface InputProps {
  projectId: string;
  className?: string;
}

interface DataProps {
  project: GetProjectChildProps;
  windowSize: GetWindowSizeChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  selectedPhase: IPhaseData | null;
}

class ProjectTimelineContainer extends PureComponent<Props, State> {
  subscription: Subscription | null = null;

  constructor(props) {
    super(props);
    this.state = {
      selectedPhase: null,
    };
  }

  componentDidMount() {
    this.subscription = selectedPhase$.subscribe((selectedPhase) => {
      this.setState({ selectedPhase });
    });
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.projectId !== this.props.projectId) {
      this.setState({ selectedPhase: null });
    }
  }

  componentWillUnmount() {
    this.subscription?.unsubscribe();
    this.subscription = null;
  }

  render() {
    const { project, className, windowSize } = this.props;
    const { selectedPhase } = this.state;
    const selectedPhaseId = selectedPhase ? selectedPhase.id : null;
    const isPBPhase =
      selectedPhase?.attributes?.participation_method === 'budgeting';
    const participationMethod = !isNilOrError(selectedPhase)
      ? selectedPhase.attributes.participation_method
      : null;
    const smallerThanBigTablet = windowSize
      ? windowSize <= viewportWidths.smallTablet
      : false;

    if (!isNilOrError(project) && selectedPhase !== undefined) {
      return (
        <Container className={`${className || ''} e2e-project-process-page`}>
          <FirstRow>
            <StyledTimeline projectId={project.id} />
            <StyledProjectArchivedIndicator projectId={project.id} />
            <ContentContainer>
              <StyledPhaseAbout
                projectId={project.id}
                phaseId={selectedPhaseId}
              />
              {isPBPhase && (
                <StyledPBExpenses
                  participationContextId={selectedPhaseId}
                  participationContextType="phase"
                  viewMode={smallerThanBigTablet ? 'column' : 'row'}
                />
              )}
              <StyledPhaseSurvey
                projectId={project.id}
                phaseId={selectedPhaseId}
              />
            </ContentContainer>
          </FirstRow>
          <SecondRow>
            <SecondRowContentContainer>
              <StyledPhasePoll
                projectId={project.id}
                phaseId={selectedPhaseId}
              />
              <StyledPhaseVolunteering
                projectId={project.id}
                phaseId={selectedPhaseId}
              />
            </SecondRowContentContainer>
          </SecondRow>

          {(participationMethod === 'ideation' ||
            participationMethod === 'budgeting') &&
            selectedPhaseId && (
              <SecondRow>
                <SecondRowContentContainer>
                  <StyledPhaseIdeas
                    projectId={project.id}
                    phaseId={selectedPhaseId}
                  />
                </SecondRowContentContainer>
                <EventsPreview projectId={project.id} />
              </SecondRow>
            )}
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  project: ({ projectId, render }) => (
    <GetProject projectId={projectId}>{render}</GetProject>
  ),
  windowSize: <GetWindowSize />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <ProjectTimelineContainer {...inputProps} {...dataProps} />}
  </Data>
);
