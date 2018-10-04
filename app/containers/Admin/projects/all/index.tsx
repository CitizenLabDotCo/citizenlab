import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// services
import { IProjectData, reorderProject } from 'services/projects';
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import GetProjectGroups from 'resources/GetProjectGroups';

// localisation
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import messages from '../messages';

// components
import { SortableList, SortableRow, List, Row } from 'components/admin/ResourceList';
import PageWrapper from 'components/admin/PageWrapper';
import Button from 'components/UI/Button';
import Title from 'components/admin/PageTitle';
import StatusLabel from 'components/UI/StatusLabel';
import HasPermission from 'components/HasPermission';
import { fontSizes, colors } from 'utils/styleUtils';

// style
import styled from 'styled-components';

const ListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;

  &.marginTop {
    margin-top: 70px;
  }
`;

const ListHeaderTitle = styled.h3`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.xl}px;
  font-weight: 400;
  padding: 0;
  margin: 0;
`;

const RowContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RowContentInner = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-right: 20px;
`;

const RowTitle = styled(T)`
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 24px;
  margin-right: 10px;
`;

const StyledStatusLabel = styled(StatusLabel)`
  margin-right: 5px;
  margin-top: 4px;
  margin-bottom: 4px;
`;

const StyledButton = styled(Button)``;

interface InputProps {}

interface DataProps {
  projects: GetProjectsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  draftProjects: IProjectData[] | null;
  publishedProjects: IProjectData[] | null;
  archivedProjects: IProjectData[] | null;
}

class AdminProjectsList extends PureComponent<Props, State> {

  handleReorder = (projectId, newOrder) => {
    reorderProject(projectId, newOrder);
  }

  render () {
    const { projects } = this.props;
    let lists: JSX.Element | null = null;

    if (projects && !isNilOrError(projects.projectsList)) {
      const { projectsList } = projects;
      const draftProjects = projectsList.filter((project) => {
        return project.attributes.publication_status === 'draft';
      });
      const publishedProjects = projectsList.filter((project) => {
        return project.attributes.publication_status === 'published';
      });
      const archivedProjects = projectsList.filter((project) => {
        return project.attributes.publication_status === 'archived';
      });

      const row = (project : IProjectData) => {
        return (
          <RowContent>
            <RowContentInner className="expand primary">
              <RowTitle value={project.attributes.title_multiloc} />
              {project.attributes.visible_to === 'groups' &&
                <GetProjectGroups projectId={project.id}>
                  {(projectGroups) => {
                    if (!isNilOrError(projectGroups)) {
                      return (
                        <StyledStatusLabel
                          text={projectGroups.length > 0 ? (
                            <FormattedMessage {...messages.xGroupsHaveAccess} values={{ groupCount: projectGroups.length }} />
                          ) : (
                            <FormattedMessage {...messages.onlyAdminsCanView} />
                          )}
                          color="clBlue"
                          icon="lock"
                        />
                      );
                    }

                    return null;
                  }}
                </GetProjectGroups>
              }

              {project.attributes.visible_to === 'admins' &&
                <StyledStatusLabel
                  text={<FormattedMessage {...messages.onlyAdminsCanView} />}
                  color="clBlue"
                  icon="lock"
                />
              }
            </RowContentInner>
            <StyledButton
              className={`e2e-admin-edit-project ${project.attributes.process_type === 'timeline' ? 'timeline' : 'continuous'}`}
              linkTo={`/admin/projects/${project.id}/edit`}
              style="secondary"
              circularCorners={false}
              icon="edit"
            >
              <FormattedMessage {...messages.editButtonLabel} />
            </StyledButton>
          </RowContent>
        );
      };

      lists = (
        <>
          {draftProjects && draftProjects.length > 0 &&
            <>
              <ListHeader className="marginTop">
                <ListHeaderTitle>
                  <FormattedMessage {...messages.draft} />
                </ListHeaderTitle>
              </ListHeader>
              <HasPermission item="projects" action="reorder">
                <SortableList
                  items={draftProjects}
                  onReorder={this.handleReorder}
                  className="e2e-admin-projects-list"
                >
                  {({ itemsList, handleDragRow, handleDropRow }) => (
                    itemsList.map((project: IProjectData, index: number) => (
                      <SortableRow
                        key={project.id}
                        id={project.id}
                        index={index}
                        moveRow={handleDragRow}
                        dropRow={handleDropRow}
                        lastItem={(index === draftProjects.length - 1)}
                      >
                        {row(project)}
                      </SortableRow>
                    ))
                  )}
                </SortableList>
                <HasPermission.No>
                  <List>
                    {draftProjects.map((project, index) => (
                      <Row key={project.id} lastItem={(index === draftProjects.length - 1)}>
                        {row(project)}
                      </Row>
                    ))}
                  </List>
                </HasPermission.No>
              </HasPermission>
            </>
          }

          {publishedProjects && publishedProjects.length > 0 &&
            <>
              <ListHeader className="marginTop">
                <ListHeaderTitle>
                  <FormattedMessage {...messages.published} />
                </ListHeaderTitle>
              </ListHeader>
              <HasPermission item="projects" action="reorder">
                <SortableList
                  items={publishedProjects}
                  onReorder={this.handleReorder}
                  className="e2e-admin-projects-list"
                >
                  {({ itemsList, handleDragRow, handleDropRow }) => (
                    itemsList.map((project: IProjectData, index: number) => (
                      <SortableRow
                        key={project.id}
                        id={project.id}
                        index={index}
                        moveRow={handleDragRow}
                        dropRow={handleDropRow}
                        lastItem={(index === publishedProjects.length - 1)}
                      >
                        {row(project)}
                      </SortableRow>
                    ))
                  )}
                </SortableList>
                <HasPermission.No>
                  <List>
                    {publishedProjects.map((project, index) => (
                      <Row key={project.id} lastItem={(index === publishedProjects.length - 1)}>
                        {row(project)}
                      </Row>
                    ))}
                  </List>
                </HasPermission.No>
              </HasPermission>
            </>
          }

          {archivedProjects && archivedProjects.length > 0 &&
            <>
              <ListHeader className="marginTop">
                <ListHeaderTitle>
                  <FormattedMessage {...messages.archived} />
                </ListHeaderTitle>
              </ListHeader>
              <List>
                {archivedProjects.map((project, index) => (
                  <Row key={project.id} lastItem={(index === archivedProjects.length - 1)}>
                    {row(project)}
                  </Row>
                ))}
              </List>
            </>
          }
        </>
      );
    }

    return (
      <>
        <Title>
          <FormattedMessage {...messages.overviewPageTitle} />
        </Title>

        <PageWrapper>
          <HasPermission item={{ type: 'route', path: '/admin/projects/new' }} action="access">
            <ListHeader>
              <Button className="e2e-admin-add-project" linkTo="/admin/projects/new" style="cl-blue" circularCorners={false} icon="plus-circle">
                <FormattedMessage {...messages.addNewProject} />
              </Button>
            </ListHeader>
          </HasPermission>
          {lists}
        </PageWrapper>
      </>
    );
  }
}

export default (inputProps: InputProps) => (
  <GetProjects publicationStatuses={['draft', 'published', 'archived']} filterCanModerate={true}>
    {projects => <AdminProjectsList {...inputProps} projects={projects} />}
  </GetProjects>
);
