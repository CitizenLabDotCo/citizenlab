import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { isBoolean, isString, isFunction } from 'lodash-es';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import clHistory from 'utils/cl-router/history';
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';

// tracking
import { trackPage } from 'utils/analytics';

// services
import { IProjectData, reorderProject } from 'services/projects';
import { updateTenant } from 'services/tenant';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetProjects, { GetProjectsChildProps, PublicationStatus } from 'resources/GetProjects';
import GetProjectGroups from 'resources/GetProjectGroups';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

// localisation
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import messages from './messages';

// utils
import eventEmitter from 'utils/eventEmitter';

// components
import { SortableList, SortableRow, List, Row } from 'components/admin/ResourceList';
import { HeaderTitle } from './styles';
import CreateProject from './CreateProject';
import PageWrapper from 'components/admin/PageWrapper';
import Button from 'components/UI/Button';
import { PageTitle, SectionSubtitle } from 'components/admin/Section';
import StatusLabel from 'components/UI/StatusLabel';
import HasPermission from 'components/HasPermission';
import Toggle from 'components/UI/Toggle';
import FeatureFlag from 'components/FeatureFlag';
import InfoTooltip from 'components/admin/InfoTooltip';
import ProjectTemplatePreviewPageAdmin from 'components/ProjectTemplatePreview/ProjectTemplatePreviewPageAdmin';

// style
import { fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';

const Container = styled.div``;

const CreateAndEditProjectsContainer = styled.div`
  &.hidden {
    display: none;
  }
`;

const ProjectTemplatePreviewContainer = styled.div`
  &.hidden {
    display: none;
  }
`;

const StyledCreateProject = styled(CreateProject)`
  margin-bottom: 18px;
`;

const ListsContainer = styled.div``;

const ListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 25px;

  & ~ & {
    margin-top: 70px;
  }
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

export interface InputProps {
  className?: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenant: GetTenantChildProps;
  projects: GetProjectsChildProps;
}

interface Props extends InputProps, DataProps { }

interface State {
  selectedProjectTemplateId: string | null;
}

const useCapture = false;

class AdminProjectsList extends PureComponent<Props, State> {
  subscriptions: Subscription[];
  unlisten: Function | null = null;
  url: string | null | undefined = null;
  goBackUrl: string | null | undefined = null;

  constructor(props) {
    super(props);
    this.state = {
      selectedProjectTemplateId: null
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions = [
      eventEmitter.observeEvent<string>('ProjectTemplateCardClicked').subscribe(({ eventValue }) => {
        if (isString(eventValue)) {
          const selectedProjectTemplateId = eventValue;
          const { locale } = this.props;
          const url = `/admin/projects/templates/${selectedProjectTemplateId}`;

          if (!isNilOrError(locale) && url) {
            this.url = `${window.location.origin}/${locale}${removeLocale(url).pathname}`;
            this.goBackUrl = `${window.location.origin}/${locale}${removeLocale(window.location.pathname).pathname}`;
            window.history.pushState({ path: this.url }, '', this.url);
            window.addEventListener('popstate', this.handlePopstateEvent, useCapture);
            window.addEventListener('keydown', this.handleKeypress, useCapture);
            this.unlisten = clHistory.listen(() => this.goBack());
            trackPage(this.url);
          }

          window.scrollTo(0, 0);
          this.setState({ selectedProjectTemplateId });
        }
      })
    ];
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    if (prevState.selectedProjectTemplateId && !this.state.selectedProjectTemplateId) {
      this.cleanup();
    }
  }

  componentWillUnmount() {
    this.cleanup();
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleReorder = (projectId, newOrder) => {
    reorderProject(projectId, newOrder);
  }

  goBack = () => {
    this.setState({ selectedProjectTemplateId: null });
  }

  useTemplate = () => {
    // empty
  }

  cleanup = () => {
    if (this.goBackUrl) {
      window.removeEventListener('popstate', this.handlePopstateEvent, useCapture);
      window.removeEventListener('keydown', this.handleKeypress, useCapture);

      if (window.location.href === this.url) {
        window.history.pushState({ path: this.goBackUrl }, '', this.goBackUrl);
      }
    }

    this.url = null;
    this.goBackUrl = null;

    if (isFunction(this.unlisten)) {
      this.unlisten();
      this.unlisten = null;
    }
  }

  handlePopstateEvent = () => {
    this.goBack();
  }

  handleKeypress = (event) => {
    if (event.type === 'keydown' && event.key === 'Escape') {
      event.preventDefault();
      this.goBack();
    }
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
    const { selectedProjectTemplateId } = this.state;
    const { tenant, projects, className } = this.props;
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
          <RowContent className="e2e-admin-projects-list-item">
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
              icon="edit"
            >
              <FormattedMessage {...messages.editButtonLabel} />
            </StyledButton>
          </RowContent>
        );
      };

      lists = (
        <ListsContainer>
          {publishedProjects && publishedProjects.length > 0 &&
            <>
              <ListHeader>
                <HeaderTitle>
                  <FormattedMessage {...messages.published} />
                </HeaderTitle>
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
                    className="projects-list e2e-admin-projects-list"
                    id="e2e-admin-published-projects-list"
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
                <HeaderTitle>
                  <FormattedMessage {...messages.draft} />
                </HeaderTitle>
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
                <HeaderTitle>
                  <FormattedMessage {...messages.archived} />
                </HeaderTitle>
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
        </ListsContainer>
      );
    }

    return (
      <Container className={className}>
        <CreateAndEditProjectsContainer className={selectedProjectTemplateId ? 'hidden' : ''}>
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

          <StyledCreateProject />

          <PageWrapper>
            {lists}
          </PageWrapper>
        </CreateAndEditProjectsContainer>

        <ProjectTemplatePreviewContainer className={!selectedProjectTemplateId ? 'hidden' : ''}>
          {selectedProjectTemplateId &&
            <ProjectTemplatePreviewPageAdmin
              projectTemplateId={selectedProjectTemplateId}
              goBack={this.goBack}
              useTemplate={this.useTemplate}
            />
          }
        </ProjectTemplatePreviewContainer>
      </Container>
    );
  }
}

const publicationStatuses: PublicationStatus[] = ['draft', 'published', 'archived'];

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenant: <GetTenant />,
  projects: <GetProjects publicationStatuses={publicationStatuses} filterCanModerate={true} />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <AdminProjectsList {...inputProps} {...dataProps} />}
  </Data>
);
