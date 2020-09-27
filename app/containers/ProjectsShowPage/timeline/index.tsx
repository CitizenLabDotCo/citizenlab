import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { Subscription } from 'rxjs';
import { isNilOrError } from 'utils/helperUtils';

// components
import Timeline, { selectedPhase$ } from './Timeline';
import PhaseAbout from './About';
import PBExpenses from '../shared/pb/PBExpenses';
import PhaseSurvey from './Survey';
import PhasePoll from './Poll';
import PhaseVolunteering from './Volunteering';
import PhaseIdeas from './Ideas';
import ContentContainer from 'components/ContentContainer';

// services
import { IPhaseData } from 'services/phases';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// style
import styled from 'styled-components';
import { colors, viewportWidths, media } from 'utils/styleUtils';
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-top: 60px;
  background: ${colors.background};

  ${media.smallerThanMinTablet`
    padding-top: 40px;
  `}
`;

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
          <div>
            <Timeline projectId={project.id} />
            <ContentContainer>
              <PhaseAbout projectId={project.id} phaseId={selectedPhaseId} />
              {isPBPhase && (
                <PBExpenses
                  participationContextId={selectedPhaseId}
                  participationContextType="phase"
                  viewMode={smallerThanBigTablet ? 'column' : 'row'}
                />
              )}
              <PhaseSurvey projectId={project.id} phaseId={selectedPhaseId} />
            </ContentContainer>
          </div>
          <div>
            <ContentContainer>
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
                <ContentContainer>
                  <PhaseIdeas
                    projectId={project.id}
                    phaseId={selectedPhaseId}
                  />
                </ContentContainer>
              </div>
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
