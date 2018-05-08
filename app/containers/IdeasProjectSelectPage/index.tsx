import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { browserHistory, withRouter, WithRouterProps } from 'react-router';
import { groupBy, isEmpty, isNull } from 'lodash';

// services
import { IProjectData } from 'services/projects';

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';

// components
import ContentContainer from 'components/ContentContainer';
import ProjectCard from './ProjectCard';
import Button from 'components/UI/Button';
import ButtonBar from 'components/ButtonBar';
import Spinner from 'components/UI/Spinner';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Loading = styled.div`
  width: 100%;
  height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  display: flex;
  align-items: center;
  justify-content: center;

  ${media.smallerThanMaxTablet`
    height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}
`;

const Container = styled.div`
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  background: #f9f9fa;

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}
`;

const StyledContentContainer = styled(ContentContainer)`
  display: flex;
  flex-direction: column;
  padding-bottom: 140px;

  ${media.smallerThanMaxTablet`
    padding-bottom: 60px;
  `}
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

const ColumnsContainer = styled.div`
  flex: 1;
  display: flex;

  ${media.biggerThanMaxTablet`
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-between;
  `}

  ${media.smallerThanMaxTablet`
    flex-direction: column;
  `}
`;

const PageTitle = styled.h1`
  color: #333;
  font-size: 34px;
  line-height: 40px;
  font-weight: 500;
  text-align: center;
  margin: 0;
  padding: 0;
  padding-top: 60px;
  padding-bottom: 40px;

  ${media.smallerThanMaxTablet`
    font-size: 28px;
    line-height: 34px;
  `}

  &:not(.noProjects) {
    ${media.smallerThanMaxTablet`
      text-align: left;
    `}
  }
`;

const Column = styled.div`
  flex: 0 0 46%;

  &.fullWidth {
    flex: 1;
  }

  ${media.smallerThanMaxTablet`
    flex: 1;
  `}
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
  font-size: 17px;
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

  ${media.smallerThanMaxTablet`
    margin-left: 35px;
  `}
`;

const WithoutButtonBar = styled.div`
  flex: 1;
  display: flex;

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const EmptyStateContainer = styled.div`
  color: #474747;
  font-size: 18px;
  line-height: 24px;
  text-align: center;
  padding-top: 15px;
`;

interface InputProps {}

interface DataProps {
  projects: GetProjectsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  selectedProjectId: string | null;
}

class IdeasProjectSelectPage extends React.PureComponent<Props & WithRouterProps, State> {

  constructor(props: Props & WithRouterProps) {
    super(props);
    this.state = {
      selectedProjectId: null,
    };
  }

  handleProjectClick = (project: IProjectData) => () => {
    this.setState({ selectedProjectId: project.id });
  }

  redirectTo = (projectSlug: string) => {
    const queryParams = (this.props.location && this.props.location.search) || '';
    browserHistory.push(`/projects/${projectSlug}/ideas/new${queryParams}`);
  }

  handleOnSubmitClick = () => {
    const { projectsList } = this.props.projects;

    if (!isNilOrError(projectsList)) {
      const project = projectsList.find((project) => project.id === this.state.selectedProjectId);

      if (project) {
        this.redirectTo(project.attributes.slug);
      }
    }
  }

  render() {
    const { projectsList } = this.props.projects;
    const { selectedProjectId } = this.state;

    if (isNull(projectsList)) {
      return (
        <Loading>
          <Spinner size="32px" color="#666" />
        </Loading>
      );
    }

    if (!isNilOrError(projectsList)) {
      const { open_idea_box: openProjects, null: cityProjects } = groupBy(projectsList, (project) => project.attributes.internal_role);
      const openProject = openProjects && !isEmpty(openProjects) && openProjects[0];
      const noProjects = isEmpty(projectsList);

      return (
        <Container>
          <StyledContentContainer>
            <PageTitle className={noProjects ? 'noProjects' : ''}>
              <FormattedMessage {...messages.pageTitle} />
            </PageTitle>

            {noProjects &&
              <EmptyStateContainer>
                <FormattedMessage {...messages.noProjects} />
              </EmptyStateContainer>
            }

            {!noProjects &&
              <Content>
                <ColumnsContainer>

                  {cityProjects &&
                    <LeftColumn className={!openProject ? 'fullWidth' : ''}>
                      <ColumnTitle>
                        <FormattedMessage {...messages.cityProjects} />
                      </ColumnTitle>
                      <ColumnExplanation>
                        <FormattedMessage {...messages.cityProjectsExplanation} />
                      </ColumnExplanation>
                      <ProjectsList>
                        {cityProjects.map((project) => (
                          <ProjectCardWrapper key={project.id}>
                            <ProjectCard
                              onClick={this.handleProjectClick(project)}
                              projectId={project.id}
                              selected={(selectedProjectId === project.id)}
                              className="e2e-project-card"
                            />
                          </ProjectCardWrapper>
                        ))}
                      </ProjectsList>
                    </LeftColumn>
                  }

                  {openProject &&
                    <RightColumn className={!cityProjects ? 'fullWidth' : ''}>
                      {cityProjects &&
                        <>
                          <ColumnTitle>
                            <FormattedMessage {...messages.openProject} />
                          </ColumnTitle>
                          <ColumnExplanation>
                            <FormattedMessage {...messages.openProjectExplanation} />
                          </ColumnExplanation>
                        </>
                      }
                      <ProjectsList>
                        <ProjectCardWrapper>
                          <ProjectCard
                            key={openProject.id}
                            onClick={this.handleProjectClick(openProject)}
                            projectId={openProject.id}
                            selected={(selectedProjectId === openProject.id)}
                            className="e2e-project-card e2e-open-project"
                          />
                        </ProjectCardWrapper>
                      </ProjectsList>
                    </RightColumn>
                  }
                </ColumnsContainer>

                <WithoutButtonBar>
                  <Button
                    className="e2e-submit-project-select-form-mobile"
                    size="2"
                    text={<FormattedMessage {...messages.continueButton} />}
                    onClick={this.handleOnSubmitClick}
                    disabled={!selectedProjectId}
                  />
                </WithoutButtonBar>

                <ButtonBar>
                  <ButtonBarInner>
                    <Button
                      className="e2e-submit-project-select-form"
                      size="1"
                      text={<FormattedMessage {...messages.continueButton} />}
                      onClick={this.handleOnSubmitClick}
                      disabled={!selectedProjectId}
                    />
                  </ButtonBarInner>
                </ButtonBar>
              </Content>
            }
          </StyledContentContainer>
        </Container>
      );
    }

    return null;
  }
}

const IdeasProjectSelectPageWithHoCs = withRouter(IdeasProjectSelectPage);

export default (inputProps: InputProps) => (
  <GetProjects {...inputProps}>
    {projects => <IdeasProjectSelectPageWithHoCs {...inputProps} projects={projects} />}
  </GetProjects>
);
