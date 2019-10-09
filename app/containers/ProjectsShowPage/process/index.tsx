import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

// components
import Timeline from './Timeline';
import PhaseAbout from './PhaseAbout';
import PBExpenses from '../pb/PBExpenses';
import PhaseSurvey from './PhaseSurvey';
import PhasePolling from './PhasePolling';
import PhaseIdeas from './PhaseIdeas';
import EventsPreview from '../EventsPreview';
import ProjectArchivedIndicator from 'components/ProjectArchivedIndicator';
import ContentContainer from 'components/ContentContainer';

// utils
import eventEmitter from 'utils/eventEmitter';

// services
import { IPhaseData } from 'services/phases';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// style
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';

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
`;

const StyledPhaseSurvey = styled(PhaseSurvey)`
  margin-bottom: 50px;
`;

const StyledPhasePolling = styled(PhasePolling)`
  margin-bottom: 50px;
  margin-top: 70px;
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
}

interface Props extends InputProps, DataProps { }

interface State {
  selectedPhase: IPhaseData | null;
}

class ProjectTimelinePage extends PureComponent<Props & WithRouterProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedPhase: null
    };
    this.broadcastSelectedPhaseId(null);
  }

  componentWillUnmount() {
    this.broadcastSelectedPhaseId(null);
  }

  handleOnPhaseSelected = (selectedPhase: IPhaseData | null) => {
    this.setState({ selectedPhase });
    this.broadcastSelectedPhaseId(get(selectedPhase, 'id', null));
  }

  broadcastSelectedPhaseId = (selectedPhaseId: string | null) => {
    eventEmitter.emit<string | null>('ProjectTimelinePage', 'SelectedProjectPhaseChanged', selectedPhaseId);
  }

  render() {
    const { project, className } = this.props;
    const { slug } = this.props.params;
    const { selectedPhase } = this.state;
    const selectedPhaseId = (selectedPhase ? selectedPhase.id : null);
    const isPBPhase = (selectedPhase && selectedPhase.attributes.participation_method === 'budgeting');
    const participationMethod = (!isNilOrError(selectedPhase) ? selectedPhase.attributes.participation_method : null);

    if (!isNilOrError(project)) {
      if (project.attributes.process_type !== 'timeline') {
        clHistory.push(`/projects/${slug}/info`);
      }

      return (
        <Container className={`${className} e2e-project-process-page`}>
          <FirstRow>
            <StyledTimeline projectId={project.id} onPhaseSelected={this.handleOnPhaseSelected} />
            <StyledProjectArchivedIndicator projectId={project.id} />
            <ContentContainer>
              <StyledPhaseAbout phaseId={selectedPhaseId} />
              {isPBPhase &&
                <StyledPBExpenses
                  participationContextId={selectedPhaseId}
                  participationContextType="Phase"
                />
              }
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
            </SecondRowContentContainer>
          </SecondRow>

          {(participationMethod === 'ideation' || participationMethod === 'budgeting') && selectedPhaseId &&
            <SecondRow>
              <SecondRowContentContainer>
                <StyledPhaseIdeas projectId={project.id} phaseId={selectedPhaseId} />
              </SecondRowContentContainer>
              <EventsPreview projectId={project.id} />
            </SecondRow>
          }
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  project: ({ params, render }) => <GetProject slug={params.slug}>{render}</GetProject>
});

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <ProjectTimelinePage {...inputProps} {...dataProps} />}
  </Data>
));
