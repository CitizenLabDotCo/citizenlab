import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { isString, isFunction } from 'lodash-es';
import clHistory from 'utils/cl-router/history';
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';

// tracking
import { trackPage } from 'utils/analytics';

// services
import { IProjectData, reorderProject } from 'services/projects';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetProjects, { GetProjectsChildProps, PublicationStatus } from 'resources/GetProjects';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// localisation
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import eventEmitter from 'utils/eventEmitter';
import { isAdmin } from 'services/permissions/roles';

// components
import { SortableList, SortableRow, List, Row } from 'components/admin/ResourceList';
import { HeaderTitle } from './styles';
import CreateProject from './CreateProject';
import PageWrapper from 'components/admin/PageWrapper';
import Button from 'components/UI/Button';
import { PageTitle, SectionSubtitle } from 'components/admin/Section';
import HasPermission from 'components/HasPermission';
import IconTooltip from 'components/UI/IconTooltip';

import ProjectTemplatePreviewPageAdmin from 'components/ProjectTemplatePreview/ProjectTemplatePreviewPageAdmin';

// style
import styled from 'styled-components';
import { IProjectFolderData } from 'services/projectFolders';
import ProjectRow, { RowContent, RowContentInner, RowTitle, RowButton } from '../components/ProjectRow';
import GetFolderOrProjectOrderings, { GetFolderOrProjectOrderingsChildProps } from 'resources/GetFolderOrProjectOrderings';
import { IFolderOrProjectOrderingData } from 'services/folderOrProjectOrderings';
import GetProject from 'resources/GetProject';
import GetProjectFolder from 'resources/GetProjectFolder';

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

export interface InputProps {
  className?: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  authUser: GetAuthUserChildProps;
  projects: GetProjectsChildProps;
  folderOrProjectsOrderings: GetFolderOrProjectOrderingsChildProps;
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
            this.url = `${window.location.origin}/${locale}${url}`;
            this.goBackUrl = 'window.location.href';
            this.goBackUrl = `${window.location.origin}/${locale}${removeLocale(window.location.pathname).pathname}`;
            window.history.pushState({ path: this.url }, '', this.url);
            window.addEventListener('popstate', this.handlePopstateEvent, useCapture);
            window.addEventListener('keydown', this.handleKeypress, useCapture);
            this.unlisten = clHistory.listen(() => this.closeTemplatePreview());
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

  closeTemplatePreview = () => {
    this.setState({ selectedProjectTemplateId: null });
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
    this.closeTemplatePreview();
  }

  handleKeypress = (event: KeyboardEvent) => {
    if (event.type === 'keydown' && event.key === 'Escape') {
      event.preventDefault();
      this.closeTemplatePreview();
    }
  }

  render() {
    const { selectedProjectTemplateId } = this.state;
    const { authUser, projects, className, folderOrProjectsOrderings } = this.props;
    const userIsAdmin = !isNilOrError(authUser) ? isAdmin({ data: authUser }) : false;
    let lists: JSX.Element | null = null;

    if (projects && !isNilOrError(projects.projectsList) && !isNilOrError(folderOrProjectsOrderings)) {
      const { projectsList } = projects;
      const draftProjects = projectsList.filter((project) => {
        return project.attributes.publication_status === 'draft';
      });
      const archivedProjects = projectsList.filter((project) => {
        return project.attributes.publication_status === 'archived';
      });

      const FolderRow = (folder: IProjectFolderData) => {
        return (
          <RowContent className="e2e-admin-projects-list-item">
            <RowContentInner className="expand primary">
              <RowTitle value={folder.attributes.title_multiloc} />
            </RowContentInner>
            <RowButton
              className={`e2e-admin-edit-project ${folder.attributes.title_multiloc['en-GB'] ? folder.attributes.title_multiloc['en-GB'] : ''}`}
              linkTo={`/admin/folders/${folder.id}`}
              buttonStyle="secondary"
              icon="edit"
            >
              <FormattedMessage {...messages.editButtonLabel} />
            </RowButton>
          </RowContent>
        );
      };

      lists = (
        <ListsContainer>
          {folderOrProjectsOrderings && folderOrProjectsOrderings.length > 0 &&
            <>
              <ListHeader>
                <HeaderTitle>
                  <FormattedMessage {...messages.published} />
                </HeaderTitle>
                <IconTooltip content={<FormattedMessage {...messages.publishedTooltip} />} />

                <Spacer />

                <Button
                  linkTo={'/admin/projects/folders/new'}
                >
                  <FormattedMessage {...messages.newProjectFolder} />
                </Button>
              </ListHeader>

              <HasPermission item="project" action="reorder">
                <SortableList
                  items={folderOrProjectsOrderings}
                  onReorder={this.handleReorder}
                  className="projects-list e2e-admin-projects-list"
                  id="e2e-admin-published-projects-list"
                >
                  {({ itemsList, handleDragRow, handleDropRow }) => (
                    itemsList.map((item: IFolderOrProjectOrderingData, index: number) => {
                      if (item.relationships.project_holder.data.type === 'project') {
                        return (
                          <GetProject projectId={item.relationships.project_holder.data.id}>
                            {project => isNilOrError(project) ? null : (
                              <SortableRow
                                key={project.id}
                                id={project.id}
                                index={index}
                                moveRow={handleDragRow}
                                dropRow={handleDropRow}
                                lastItem={(index === folderOrProjectsOrderings.length - 1)}
                              >
                                <ProjectRow project={project} />
                              </SortableRow>
                            )}
                          </GetProject>
                        );
                      } else {
                        return (
                          <GetProjectFolder projectFolderId={item.relationships.project_holder.data.id}>
                            {projectFolder => isNilOrError(projectFolder) ? null : (
                              <SortableRow
                                key={projectFolder.id}
                                id={projectFolder.id}
                                index={index}
                                moveRow={handleDragRow}
                                dropRow={handleDropRow}
                                lastItem={(index === folderOrProjectsOrderings.length - 1)}
                              >
                                {FolderRow(projectFolder)}
                              </SortableRow>
                            )}
                          </GetProjectFolder>
                        );
                      }
                    }
                    ))}
                </SortableList>
                }
{/* TODO                <HasPermission.No>
                  <List>
                    {folderOrProjectsOrderings.map((project, index) => (
                      <Row key={project.id} lastItem={(index === folderOrProjectsOrderings.length - 1)}>
                        <ProjectRow project={project} />
                      </Row>
                    ))}
                  </List>
                </HasPermission.No>*/}
              </HasPermission>
            </>
          }

          {draftProjects && draftProjects.length > 0 &&
            <>
              <ListHeader>
                <HeaderTitle>
                  <FormattedMessage {...messages.draft} />
                </HeaderTitle>
                <IconTooltip content={<FormattedMessage {...messages.draftTooltip} />} />
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
                        <ProjectRow project={project} />
                      </SortableRow>
                    ))
                  )}
                </SortableList>
                <HasPermission.No>
                  <List>
                    {draftProjects.map((project, index) => (
                      <Row key={project.id} lastItem={(index === draftProjects.length - 1)}>
                        <ProjectRow project={project} />
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
                <IconTooltip content={<FormattedMessage {...messages.archivedTooltip} />} />
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
                        <ProjectRow project={project} />
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
                        <ProjectRow project={project} />
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

          {userIsAdmin && <StyledCreateProject />}

          <PageWrapper>
            {lists}
          </PageWrapper>
        </CreateAndEditProjectsContainer>

        <ProjectTemplatePreviewContainer className={!selectedProjectTemplateId ? 'hidden' : ''}>
          {selectedProjectTemplateId &&
            <ProjectTemplatePreviewPageAdmin
              projectTemplateId={selectedProjectTemplateId}
              goBack={this.closeTemplatePreview}
            />
          }
        </ProjectTemplatePreviewContainer>
      </Container>
    );
  }
}

const publicationStatuses: PublicationStatus[] = ['draft', 'archived'];

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  authUser: <GetAuthUser />,
  folderOrProjectsOrderings: <GetFolderOrProjectOrderings />,
  projects: <GetProjects publicationStatuses={publicationStatuses} filterCanModerate={true} />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <AdminProjectsList {...inputProps} {...dataProps} />}
  </Data>
);
