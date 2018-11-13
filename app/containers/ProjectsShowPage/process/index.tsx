import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

// components
import Header from '../Header';
import Timeline from './Timeline';
import PhaseAbout from './PhaseAbout';
import PBExpenses from '../pb/PBExpenses';
import PhaseSurvey from './PhaseSurvey';
import PhaseIdeas from './PhaseIdeas';
import EventsPreview from '../EventsPreview';
import ProjectModeratorIndicator from 'components/ProjectModeratorIndicator';
import Warning from 'components/UI/Warning';
import ContentContainer from 'components/ContentContainer';

// services
import { IPhaseData } from 'services/phases';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../Admin/pages/messages';

// style
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';

const Container = styled.div``;

const FirstRow = styled.div`
  background: #fff;
`;

const StyledTimeline = styled(Timeline)`
  ${media.smallerThanMaxTablet`
    margin-bottom: 40px;
  `}
`;

const SecondRow = styled.div`
  background: ${colors.background};
`;

const StyledPhaseAbout = styled(PhaseAbout)`
  margin-bottom: 70px;
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

const StyledPhaseIdeas = styled(PhaseIdeas)`
  margin-top: 70px;
  margin-bottom: 70px;
`;

interface InputProps {
  className?: string;
}

interface DataProps {
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  selectedPhase: IPhaseData | null;
}

class ProjectTimelinePage extends PureComponent<Props & WithRouterProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedPhase: null
    };
  }

  handleOnPhaseSelected = (selectedPhase: IPhaseData | null) => {
    this.setState({ selectedPhase });
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
        <Container className={className}>
          <Header projectSlug={slug} phaseId={selectedPhaseId} />
          <FirstRow>
            <StyledTimeline projectId={project.id} onPhaseSelected={this.handleOnPhaseSelected} />
            <ProjectModeratorIndicator projectId={project.id} />
            <ContentContainer>
              {project.attributes.publication_status === 'archived' &&
                <Warning text={<FormattedMessage {...messages.archivedProject} />} />
              }
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

          {(participationMethod === 'ideation' || participationMethod === 'budgeting') &&
            <SecondRow>
              <SecondRowContentContainer>
                <StyledPhaseIdeas phaseId={selectedPhaseId} />
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
