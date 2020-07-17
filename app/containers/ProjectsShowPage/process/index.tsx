import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { Subscription } from 'rxjs';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

// components
import Timeline, { selectedPhase$ } from './Timeline';
import PhaseAbout from './PhaseAbout';
import PBExpenses from '../pb/PBExpenses';
import PhaseSurvey from './PhaseSurvey';
import PhasePolling from './PhasePolling';
import PhaseVolunteering from './PhaseVolunteering';
import PhaseIdeas from './PhaseIdeas';
import EventsPreview from '../EventsPreview';
import ProjectArchivedIndicator from 'components/ProjectArchivedIndicator';
import ContentContainer from 'components/ContentContainer';

// services
import { IPhaseData } from 'services/phases';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// style
import styled from 'styled-components';
import { colors, media, viewportWidths } from 'utils/styleUtils';
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const FirstRow = styled.div`
  background: #fff;

  ${media.smallerThanMaxTablet`
    background: ${colors.background};
  `}
`;

const StyledTimeline = styled(Timeline)`
  background: #fff;

  ${media.smallerThanMaxTablet`
    margin-bottom: 40px;
  `}
`;

const StyledProjectArchivedIndicator = styled(ProjectArchivedIndicator)`
  padding-bottom: 30px;

  ${media.tablet`
    margin-top: -30px;
  `}
`;

const SecondRow = styled.div`
  background: ${colors.background};
`;

const StyledPhaseAbout = styled(PhaseAbout)`
  margin-bottom: 80px;

  ${media.smallerThanMaxTablet`
    margin-bottom: 50px;
  `}
`;

const SecondRowContentContainer = styled(ContentContainer)`
  z-index: 0;
`;

const StyledPBExpenses = styled(PBExpenses)`
  margin-bottom: -120px;
  padding: 30px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: solid 1px ${colors.separation};

  ${media.smallerThanMaxTablet`
    padding: 20px;
  `}
`;

const StyledPhaseSurvey = styled(PhaseSurvey)`
  margin-bottom: 50px;
`;

const StyledPhasePolling = styled(PhasePolling)`
  margin-top: 70px;
  margin-bottom: 50px;

  ${media.smallerThanMinTablet`
    margin-top: 0px;
    margin-bottom: 25px;
  `}
`;

const StyledPhaseVolunteering = styled(PhaseVolunteering)`
  margin-top: 70px;
  margin-bottom: 50px;

  ${media.smallerThanMinTablet`
    margin-top: 0px;
    margin-bottom: 25px;
  `}
`;

const StyledPhaseIdeas = styled(PhaseIdeas)`
  margin-top: 95px;
  margin-bottom: 100px;

  ${media.smallerThanMaxTablet`
    margin-top: 0px;
  `}
`;

interface InputProps {
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

class ProjectTimelinePage extends PureComponent<
  Props & WithRouterProps,
  State
> {
  subscription: Subscription;

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

  componentDidUpdate(prevProps: Props & WithRouterProps, _prevState: State) {
    if (prevProps.params.slug !== this.props.params.slug) {
      this.setState({ selectedPhase: null });
    }
  }

  componentWillUnmount() {
    this.subscription && this.subscription.unsubscribe();
  }

  render() {
    const {
      project,
      className,
      params: { slug },
      windowSize,
    } = this.props;
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
      if (project.attributes.process_type !== 'timeline') {
        clHistory.push(`/projects/${slug}/info`);
      }

      return (
        <Container className={`${className} e2e-project-process-page`}>
          <FirstRow>
            <StyledTimeline projectId={project.id} />
            <StyledProjectArchivedIndicator projectId={project.id} />
            <ContentContainer>
              <StyledPhaseAbout phaseId={selectedPhaseId} />
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
              <StyledPhasePolling
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

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  project: ({ params, render }) => (
    <GetProject projectSlug={params.slug}>{render}</GetProject>
  ),
  windowSize: <GetWindowSize />,
});

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {(dataProps) => <ProjectTimelinePage {...inputProps} {...dataProps} />}
  </Data>
));
