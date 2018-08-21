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
    margin-top: 80px;
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
  activeProjects: IProjectData[] | null | undefined;
  archivedProjects: IProjectData[] | null | undefined;
}

class AdminProjectsList extends PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      activeProjects: undefined,
      archivedProjects: undefined
    };
  }

  static getDerivedStateFromProps(nextProps: Props, _prevState: State) {
    return {
      activeProjects: !isNilOrError(nextProps.projects.projectsList) ? nextProps.projects.projectsList.filter(project => project.attributes.publication_status !== 'archived') : null,
      archivedProjects: !isNilOrError(nextProps.projects.projectsList) ? nextProps.projects.projectsList.filter(project => project.attributes.publication_status === 'archived') : null
    };
  }

  handleReorder = (projectId, newOrder) => {
    reorderProject(projectId, newOrder);
  }

  renderRow = (project : IProjectData) => {
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

          {project.attributes.publication_status === 'draft' &&
            <StyledStatusLabel
              text={<FormattedMessage {...messages.draft} />}
              color="draftYellow"
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
  }

  render () {
    const { activeProjects, archivedProjects } = this.state;

    return (
      <>
        <Title>
          <FormattedMessage {...messages.overviewPageTitle} />
        </Title>

        <PageWrapper>
          <HasPermission item={{ type: 'route', path: '/admin/projects/new' }} action="access">
            <ListHeader>
              <ListHeaderTitle><FormattedMessage {...messages.activeProjects} /></ListHeaderTitle>
              <Button className="e2e-admin-add-project" linkTo="/admin/projects/new" style="cl-blue" circularCorners={false} icon="plus-circle">
                <FormattedMessage {...messages.addNewProject} />
              </Button>
            </ListHeader>
          </HasPermission>
          {activeProjects && activeProjects.length > 0 &&
            <HasPermission item="projects" action="reorder">
              <SortableList items={activeProjects} onReorder={this.handleReorder} className="e2e-admin-projects-list">
                {({ itemsList, handleDragRow, handleDropRow }) => (
                  itemsList.map((project: IProjectData, index: number) => (
                    <SortableRow
                      key={project.id}
                      id={project.id}
                      index={index}
                      moveRow={handleDragRow}
                      dropRow={handleDropRow}
                      lastItem={(index === activeProjects.length - 1)}
                    >
                      {this.renderRow(project)}
                    </SortableRow>
                  ))
                )}
              </SortableList>
              <HasPermission.No>
                <List>
                  {activeProjects.map((project, index) => (
                    <Row key={project.id} lastItem={(index === activeProjects.length - 1)}>
                      {this.renderRow(project)}
                    </Row>
                  ))}
                </List>
              </HasPermission.No>
            </HasPermission>
          }

          {archivedProjects && archivedProjects.length > 0 &&
            <>
              <ListHeader className="marginTop">
                <ListHeaderTitle><FormattedMessage {...messages.archivedProjects} /></ListHeaderTitle>
              </ListHeader>
              <List>
                {archivedProjects.map((project, index) => (
                  <Row key={project.id} lastItem={(index === archivedProjects.length - 1)}>
                    {this.renderRow(project)}
                  </Row>
                ))}
              </List>
            </>
          }
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
