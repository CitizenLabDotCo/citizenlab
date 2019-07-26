import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { isBoolean } from 'lodash-es';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

// services
import { IProjectData, reorderProject } from 'services/projects';
import { updateTenant } from 'services/tenant';

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import GetProjectGroups from 'resources/GetProjectGroups';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

// localisation
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import messages from './messages';

// components
import { SortableList, SortableRow, List, Row } from 'components/admin/ResourceList';
import PageWrapper from 'components/admin/PageWrapper';
import Button from 'components/UI/Button';
import { PageTitle, SectionSubtitle } from 'components/admin/Section';
import StatusLabel from 'components/UI/StatusLabel';
import HasPermission from 'components/HasPermission';
import Toggle from 'components/UI/Toggle';
import FeatureFlag from 'components/FeatureFlag';
import InfoTooltip from 'components/admin/InfoTooltip';

// style
import { fontSizes, colors } from 'utils/styleUtils';
import styled from 'styled-components';

const ListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 25px;

  & ~ & {
    margin-top: 70px;
  }
`;

const ListHeaderTitle = styled.h3`
  display: flex;
  align-items: center;
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.xl}px;
  font-weight: 400;
  padding: 0;
  margin: 0;
  margin-right: 7px;
`;

const Spacer = styled.div`
  flex: 1;
`;

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const ToggleLabel = styled.label`
  font-size: ${fontSizes.base}px;
  margin-right: 15px;
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

export interface InputProps { }

interface DataProps {
  tenant: GetTenantChildProps;
  projects: GetProjectsChildProps;
}

interface Props extends InputProps, DataProps { }

interface State {}

class AdminProjectsList extends PureComponent<Props, State> {
  handleReorder = (projectId, newOrder) => {
    reorderProject(projectId, newOrder);
  }

  handleToggleManualProjectSorting = async () => {
    const { tenant } = this.props;

    if (!isNilOrError(tenant) && tenant.attributes.settings.manual_project_sorting && isBoolean(tenant.attributes.settings.manual_project_sorting.enabled)) {
      const manualProjectSorting = !tenant.attributes.settings.manual_project_sorting.enabled;

      await updateTenant(tenant.id, {
        settings: {
          manual_project_sorting: {
            allowed: true,
            enabled: manualProjectSorting
          }
        }
      });

      await streams.fetchAllWith({ apiEndpoint: [`${API_PATH}/projects`] });
    }
  }

  render () {
    const { tenant, projects } = this.props;
    let lists: JSX.Element | null = null;

    if (projects && !isNilOrError(projects.projectsList) && !isNilOrError(tenant)) {
      const { projectsList } = projects;
      const publishedProjects = projectsList.filter((project) => {
        return project.attributes.publication_status === 'published';
      });
      const draftProjects = projectsList.filter((project) => {
        return project.attributes.publication_status === 'draft';
      });
      const archivedProjects = projectsList.filter((project) => {
        return project.attributes.publication_status === 'archived';
      });

      const row = (project: IProjectData) => {
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
              className={`e2e-admin-edit-project ${project.attributes.title_multiloc['en-GB'] ? project.attributes.title_multiloc['en-GB'] : ''} ${project.attributes.process_type === 'timeline' ? 'timeline' : 'continuous'}`}
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
          {publishedProjects && publishedProjects.length > 0 &&
            <>
              <ListHeader>
                <ListHeaderTitle>
                  <FormattedMessage {...messages.published} />
                </ListHeaderTitle>
                <InfoTooltip {...messages.publishedTooltip} />

                <Spacer />

                <HasPermission item="project" action="reorder">
                  <FeatureFlag name="manual_project_sorting" onlyCheckAllowed>
                    <ToggleWrapper>
                      <ToggleLabel htmlFor="manual-sorting-toggle">
                        <FormattedMessage {...messages.manualSortingProjects} />
                      </ToggleLabel>
                      <Toggle
                        id="manual-sorting-toggle"
                        value={(tenant.attributes.settings.manual_project_sorting as any).enabled}
                        onChange={this.handleToggleManualProjectSorting}
                      />
                    </ToggleWrapper>
                  </FeatureFlag>
                </HasPermission>
              </ListHeader>
              <HasPermission item="project" action="reorder">
                {(tenant.attributes.settings.manual_project_sorting as any).enabled ?
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
                  :
                  <List>
                    {publishedProjects.map((project, index) => (
                      <Row key={project.id} lastItem={(index === publishedProjects.length - 1)}>
                        {row(project)}
                      </Row>
                    ))}
                  </List>
                }
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

          {draftProjects && draftProjects.length > 0 &&
            <>
              <ListHeader>
                <ListHeaderTitle>
                  <FormattedMessage {...messages.draft} />
                </ListHeaderTitle>
                <InfoTooltip {...messages.draftTooltip} />
              </ListHeader>
              <HasPermission item="project" action="reorder">
                <SortableList
                  items={draftProjects}
                  onReorder={this.handleReorder}
                  className="e2e-admin-projects-list"
                  id="e2e-admin-draft-projects-list"
                >
                  {({ itemsList, handleDragRow, handleDropRow }) => (
                    itemsList.map((project: IProjectData, index: number) => (
                      <SortableRow
                        key={project.id}
                        id={project.id}
                        className="e2e-admin-projects-list-item"
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

          {archivedProjects && archivedProjects.length > 0 &&
            <>
              <ListHeader>
                <ListHeaderTitle>
                  <FormattedMessage {...messages.archived} />
                </ListHeaderTitle>
                <InfoTooltip {...messages.archivedTooltip} />
              </ListHeader>
              <HasPermission item="project" action="reorder">
                <SortableList
                  items={archivedProjects}
                  onReorder={this.handleReorder}
                  className="e2e-admin-projects-list"
                  id="e2e-admin-archived-projects-list"
                >
                  {({ itemsList, handleDragRow, handleDropRow }) => (
                    itemsList.map((project: IProjectData, index: number) => (
                      <SortableRow
                        key={project.id}
                        id={project.id}
                        className="e2e-admin-projects-list-item"
                        index={index}
                        moveRow={handleDragRow}
                        dropRow={handleDropRow}
                        lastItem={index === archivedProjects.length - 1}
                      >
                        {row(project)}
                      </SortableRow>
                    ))
                  )}
                </SortableList>

                <HasPermission.No>
                  <List id="e2e-admin-archived-projects-list">
                    {archivedProjects.map((project, index) => (
                      <Row
                        className="e2e-admin-projects-list-item"
                        key={project.id}
                        lastItem={(index === archivedProjects.length - 1)}
                      >
                        {row(project)}
                      </Row>
                    ))}
                  </List>
                </HasPermission.No>
              </HasPermission>
            </>
          }
        </>
      );
    }

    return (
      <>
        <PageTitle>
          <FormattedMessage {...messages.overviewPageTitle} />
        </PageTitle>
        <SectionSubtitle>
          <HasPermission item={{ type: 'route', path: '/admin/projects/new' }} action="access">
            <FormattedMessage {...messages.overviewPageSubtitle} />
            <HasPermission.No>
            <FormattedMessage {...messages.overviewPageSubtitleModerator} />
            </HasPermission.No>
          </HasPermission>
        </SectionSubtitle>

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

const Data = adopt<DataProps, InputProps>({
  tenant: <GetTenant />,
  projects: <GetProjects publicationStatuses={['draft', 'published', 'archived']} filterCanModerate={true} />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <AdminProjectsList {...inputProps} {...dataProps} />}
  </Data>
);
