import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { size, groupBy, isEmpty } from 'lodash';

// routing
import { browserHistory } from 'react-router';

// components
import Spinner from 'components/UI/Spinner';

// services
import { projectsStream, IProjectData } from 'services/projects';
import { projectImagesStream } from 'services/projectImages';

// components
import ContentContainer from 'components/ContentContainer';
import ProjectCard from './ProjectCard';
import Button from 'components/UI/Button';
import ButtonBar from 'components/ButtonBar';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  height: 100%;
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  background: #f6f6f6;

  ${media.smallerThanMaxTablet`
    min-height: auto;
  `}
`;

const StyledContentContainer = styled(ContentContainer)`
  padding-top: 0px;
  padding-bottom: 120px;

  ${media.smallerThanMaxTablet`
    padding-bottom: 40px;
  `}
`;

const Loading = styled.div`
  width: 100%;
  height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  display: flex;
  align-items: center;
  justify-content: center;

  ${media.smallerThanMaxTablet`
    height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - 70px);
  `}
`;

const ColumnsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  ${media.smallerThanMaxTablet`
    flex-direction: column;
    justify-content: flex-start;
  `}
`;

const PageTitle = styled.h1`
  width: 100%;
  color: #333;
  font-size: 36px;
  line-height: 42px;
  font-weight: 500;
  text-align: center;
  padding: 0;
  margin: 0;
  padding-top: 40px;
  margin-bottom: 80px;

  ${media.smallerThanMaxTablet`
    font-size: 28px;
    line-height: 34px;
    text-align: left;
    margin-bottom: 40px;
  `}
`;

const Column = styled.div`
  flex: 0 0 46%;

  &.flex {
    flex: 1 1 100%;
  }
`;

const LeftColumn = Column.extend`
  ${media.smallerThanMaxTablet`
    order: 2;
    margin-bottom: 30px;
  `}
`;

const RightColumn = Column.extend`
  ${media.smallerThanMaxTablet`
    order: 1;
    margin-bottom: 60px;
  `}
`;

const ColumnTitle = styled.h2`
  color: #333;
  font-size: 21px;
  font-weight: 500;
  line-height: 26px;
  margin: 0;
  margin-bottom: 10px;
`;

const ColumnExplanation = styled.div`
  color: #666;
  font-size: 18px;
  line-height: 24px;
  font-weight: 300;
  min-height: 7rem;
`;

const ProjectsList = styled.div``;

const ProjectCardWrapper = styled.div`
  margin-bottom: 20px;

  ${media.smallerThanMaxTablet`
    margin-bottom: 10px;
  `}
`;

const ButtonBarInner = styled.div`
  width: 100%;
  max-width: ${props => props.theme.maxPageWidth}px;
  display: flex;
  align-items: center;

  .Button {
    margin-right: 10px;
  }

  ${media.smallerThanDesktop`
    margin-left: 35px;
  `}
`;

const WithoutButtonBar = styled.div`
  ${media.biggerThanMaxTablet`
    display: none;
  `}

  padding-bottom: 20px;
`;

const EmptyStateContainer = styled.div`
  color: #474747;
  font-size: 18px;
  padding: 3rem 0;
`;

type Props = {
  theme: any;
  location: any;
};

type State = {
  projects: IProjectData[] | null;
  selectedProjectId: string | null;
  loaded: boolean;
};

export default class IdeasProjectSelectPage extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      projects: null,
      selectedProjectId: null,
      loaded: false
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const projects$ = projectsStream().observable;

    this.subscriptions = [
      projects$.switchMap((projects) => {
        return Rx.Observable.combineLatest(
          projects.data.map(project => projectImagesStream(project.id).observable)
        ).map(() => projects);
      }).subscribe((projects) => {
        this.setState({ projects: projects.data, loaded: true });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleProjectClick = (project) => () => {
    this.setState({ selectedProjectId: project.id });
  }

  redirectTo = (projectSlug) => {
    const queryParams = (this.props.location && this.props.location.search) || '';
    browserHistory.push(`/projects/${projectSlug}/ideas/new${queryParams}`);
  }

  handleOnSubmitClick = () => {
    const { projects } = this.state;

    if (projects) {
      const project = projects.find((project) => project.id === this.state.selectedProjectId);

      if (project) {
        this.redirectTo(project.attributes.slug);
      }
    }
  }

  render() {
    const { projects, selectedProjectId, loaded } = this.state;

    if (!loaded) {
      return (
        <Container>
          <Loading>
            <Spinner size="30px" color="#666" />
          </Loading>
        </Container>
      );
    }

    if (loaded) {
      const { open_idea_box: openProjects, null: cityProjects } = groupBy(projects, (project) => project.attributes.internal_role);
      const openProject = openProjects && !isEmpty(openProjects) && openProjects[0];
      const noProjects = (!projects || size(projects) === 0);

      return (
        <Container>
          <StyledContentContainer>
            <PageTitle>
              <FormattedMessage {...messages.pageTitle} />
            </PageTitle>

            {noProjects &&
              <EmptyStateContainer>
                <FormattedMessage {...messages.noProjects} />
              </EmptyStateContainer>
            }

            {!noProjects && 
              <>
                <ColumnsContainer>
                  <LeftColumn className={!openProject ? 'flex' : ''}>
                    <ColumnTitle>
                      <FormattedMessage {...messages.cityProjects} />
                    </ColumnTitle>
                    <ColumnExplanation>
                      <FormattedMessage {...messages.cityProjectsExplanation} />
                    </ColumnExplanation>
                    <ProjectsList>
                      {cityProjects && cityProjects.map((project) => (
                        <ProjectCardWrapper>
                          <ProjectCard
                            key={project.id}
                            onClick={this.handleProjectClick(project)}
                            projectId={project.id}
                            selected={(selectedProjectId === project.id)}
                          />
                        </ProjectCardWrapper>
                      ))}
                    </ProjectsList>
                  </LeftColumn>
                  {openProject &&
                    <RightColumn className={noProjects ? 'flex' : ''}>
                      <ColumnTitle>
                        <FormattedMessage {...messages.openProject} />
                      </ColumnTitle>
                      <ColumnExplanation>
                        <FormattedMessage {...messages.openProjectExplanation} />
                      </ColumnExplanation>
                      <ProjectsList>
                        <ProjectCardWrapper>
                          <ProjectCard
                            key={openProject.id}
                            onClick={this.handleProjectClick(openProject)}
                            projectId={openProject.id}
                            selected={(selectedProjectId === openProject.id)}
                          />
                        </ProjectCardWrapper>
                      </ProjectsList>
                    </RightColumn>
                  }
                </ColumnsContainer>
                <ButtonBar>
                  <ButtonBarInner>
                    <Button
                      className="e2e-submit-project-select-form"
                      size="2"
                      text={<FormattedMessage {...messages.continueButton} />}
                      onClick={this.handleOnSubmitClick}
                      disabled={!selectedProjectId}
                    />
                  </ButtonBarInner>
                </ButtonBar>
                <WithoutButtonBar>
                  <Button
                    className="e2e-submit-project-select-form"
                    size="2"
                    text={<FormattedMessage {...messages.continueButton} />}
                    onClick={this.handleOnSubmitClick}
                    disabled={!selectedProjectId}
                  />
                </WithoutButtonBar>
              </>
            }
          </StyledContentContainer>
        </Container>
      );
    }

    return null;
  }
}
