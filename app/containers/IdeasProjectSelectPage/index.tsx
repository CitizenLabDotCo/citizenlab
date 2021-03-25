import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';
import { groupBy, isEmpty, isUndefined } from 'lodash-es';

// services
import { IProjectData } from 'services/projects';

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';

// components
import ContentContainer from 'components/ContentContainer';
import ProjectSelectionCard from './ProjectSelectionCard';
import Button from 'components/UI/Button';
import ButtonBar from 'components/ButtonBar';
import { Spinner } from 'cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { media, fontSizes, colors, isRtl } from 'utils/styleUtils';

const Loading = styled.div`
  width: 100%;
  height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  align-items: center;
  justify-content: center;

  ${media.smallerThanMaxTablet`
    height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
  `}
`;

const Container = styled.main`
  width: 100%;
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  background: ${colors.background};

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
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

const PageTitle = styled.h1`
  color: #333;
  font-size: ${fontSizes.xxxxl}px;
  line-height: 40px;
  font-weight: 500;
  text-align: center;
  margin: 0;
  padding: 0;
  padding-top: 60px;
  padding-bottom: 40px;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xxxl}px;
    line-height: 34px;
  `}

  &:not(.noProjects) {
    ${media.smallerThanMaxTablet`
      text-align: left;
      ${isRtl`
        text-align: right;
      `}
    `}
  }
`;

const ColumnsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  ${isRtl`
   flex-direction: row-reverse;
 `}

  ${media.smallerThanMaxTablet`
    flex-direction: column;
    justify-content: flex-start;
  `}
`;

const Column = styled.div`
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: auto;
  width: 46%;
  display: flex;
  flex-direction: column;

  &.fullWidth {
    flex-grow: 1;
    width: 100%;
  }

  ${media.smallerThanMaxTablet`
    flex-grow: 1;
    flex-shrink: 1;
    width: 100%;
  `}
`;

const LeftColumn = styled(Column)`
  ${media.smallerThanMaxTablet`
    order: 2;
    margin-bottom: 30px;
  `}
`;

const RightColumn = styled(Column)`
  ${media.smallerThanMaxTablet`
    order: 1;
    margin-bottom: 60px;
  `}
`;

const ColumnTitle = styled.h2`
  color: #333;
  font-size: ${fontSizes.xl}px;
  font-weight: 500;
  line-height: 26px;
  margin: 0;
  margin-bottom: 10px;
`;

const ColumnExplanation = styled.div`
  color: #666;
  font-size: ${fontSizes.medium}px;
  line-height: 24px;
  font-weight: 300;
  min-height: 7rem;

  ${media.smallerThanMaxTablet`
    margin-bottom: 15px;
    min-height: auto;
  `}
`;

const ProjectsList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const ProjectCardWrapper = styled.div`
  margin-bottom: 20px;

  ${media.smallerThanMaxTablet`
    margin-bottom: 10px;
  `}
`;

const ButtonBarInner = styled.div`
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: 100%;
  max-width: ${(props) => props.theme.maxPageWidth}px;
  display: flex;
  align-items: center;

  .Button {
    margin-right: 10px;
  }

  ${media.smallerThanMaxTablet`
    margin-left: 35px;
  `}

  ${isRtl`
    flex-direction: row-reverse;
    .Button {
        margin-right: auto;
        margin-left: 10px;
    }
 `}
`;

const EmptyStateContainer = styled.div`
  color: #474747;
  font-size: ${fontSizes.large}px;
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

class IdeasProjectSelectPage extends PureComponent<
  Props & WithRouterProps,
  State
> {
  constructor(props: Props & WithRouterProps) {
    super(props);
    this.state = {
      selectedProjectId: null,
    };
  }

  handleProjectClick = (project: IProjectData) => () => {
    this.setState({ selectedProjectId: project.id });
  };

  redirectTo = (projectSlug: string) => {
    const queryParams =
      (this.props.location && this.props.location.search) || '';
    clHistory.push(`/projects/${projectSlug}/ideas/new${queryParams}`);
  };

  handleOnSubmitClick = () => {
    const { projectsList } = this.props.projects;

    if (!isNilOrError(projectsList)) {
      const project = projectsList.find(
        (project) => project.id === this.state.selectedProjectId
      );

      if (project) {
        this.redirectTo(project.attributes.slug);
      }
    }
  };

  render() {
    const { projectsList } = this.props.projects;
    const { selectedProjectId } = this.state;

    if (isUndefined(projectsList)) {
      return (
        <Loading>
          <Spinner />
        </Loading>
      );
    }

    if (!isNilOrError(projectsList)) {
      const { open_idea_box: openProjects, null: cityProjects } = groupBy(
        projectsList,
        (project) => project.attributes.internal_role
      );
      const openProject =
        openProjects && !isEmpty(openProjects) && openProjects[0];
      const noProjects = isEmpty(projectsList);

      return (
        <Container className="e2e-project-selection-page">
          <StyledContentContainer>
            <PageTitle className={noProjects ? 'noProjects' : ''}>
              <FormattedMessage {...messages.pageTitle} />
            </PageTitle>

            {noProjects && (
              <EmptyStateContainer>
                <FormattedMessage {...messages.noProjects} />
              </EmptyStateContainer>
            )}

            {!noProjects && (
              <>
                <ColumnsContainer>
                  {cityProjects && (
                    <LeftColumn className={!openProject ? 'fullWidth' : ''}>
                      <ColumnTitle>
                        <FormattedMessage {...messages.cityProjects} />
                      </ColumnTitle>
                      <ColumnExplanation>
                        <FormattedMessage
                          {...messages.cityProjectsExplanation}
                        />
                      </ColumnExplanation>
                      <ProjectsList>
                        {cityProjects.map((project) => (
                          <ProjectCardWrapper key={project.id}>
                            <ProjectSelectionCard
                              onClick={this.handleProjectClick(project)}
                              projectId={project.id}
                              selected={selectedProjectId === project.id}
                              className="e2e-project-card"
                            />
                          </ProjectCardWrapper>
                        ))}
                      </ProjectsList>
                    </LeftColumn>
                  )}

                  {openProject && (
                    <RightColumn className={!cityProjects ? 'fullWidth' : ''}>
                      {cityProjects && (
                        <>
                          <ColumnTitle>
                            <FormattedMessage {...messages.openProject} />
                          </ColumnTitle>
                          <ColumnExplanation>
                            <FormattedMessage
                              {...messages.openProjectExplanation}
                            />
                          </ColumnExplanation>
                        </>
                      )}
                      <ProjectsList>
                        <ProjectCardWrapper>
                          <ProjectSelectionCard
                            key={openProject.id}
                            onClick={this.handleProjectClick(openProject)}
                            projectId={openProject.id}
                            selected={selectedProjectId === openProject.id}
                            className="e2e-project-card e2e-open-project"
                          />
                        </ProjectCardWrapper>
                      </ProjectsList>
                    </RightColumn>
                  )}
                </ColumnsContainer>

                <ButtonBar>
                  <ButtonBarInner>
                    <Button
                      className="e2e-submit-project-select-form"
                      text={<FormattedMessage {...messages.continueButton} />}
                      onClick={this.handleOnSubmitClick}
                      disabled={!selectedProjectId}
                    />
                  </ButtonBarInner>
                </ButtonBar>
              </>
            )}
          </StyledContentContainer>
        </Container>
      );
    }

    return null;
  }
}

const IdeasProjectSelectPageWithHoCs = withRouter(IdeasProjectSelectPage);

export default (inputProps: InputProps) => (
  <GetProjects publicationStatuses={['published']}>
    {(projects) => (
      <IdeasProjectSelectPageWithHoCs {...inputProps} projects={projects} />
    )}
  </GetProjects>
);
