import React, { memo } from 'react';
import { adopt } from 'react-adopt';

// style
import styled from 'styled-components';

// utils
import { isNilOrError } from 'utils/helperUtils';

// resources
import GetProjects, { GetProjectsChildProps, PublicationStatus } from 'resources/GetProjects';
import GetProjectHolderOrderings, { GetProjectHolderOrderingsChildProps } from 'resources/GetProjectHolderOrderings';

// components
import { SortableList, SortableRow } from 'components/admin/ResourceList';
import FeatureFlag from 'components/FeatureFlag';
import ProjectRow from '../../../components/ProjectRow';
import FolderRow from '../../../components/FolderRow';
import { ListHeader, HeaderTitle } from '../../StyledComponents';
import IconTooltip from 'components/UI/IconTooltip';
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

// types
import { IProjectData } from 'services/projects';

const Spacer = styled.div`
  flex: 1;
`;

interface DataProps {
  projectHolderOrderings: GetProjectHolderOrderingsChildProps;
  publishedProjects: GetProjectsChildProps;
  projectsWithoutFolder: GetProjectsChildProps;
}

interface Props extends InputProps, DataProps { }

function getFilteredProjects(projects: IProjectData[], publicationStatus: PublicationStatus) {
  return projects.filter((project) => {
    return project.attributes.publication_status === publicationStatus;
  });
}

const AdminProjectList = memo<Props>(({ publishedProjects }) => {
  if (
    !isNilOrError(projects) &&
    projects.projectsList &&
    projects.projectsList.length > 0
  ) {
    const { projectsList } = projects;
    const publishedProjects = getFilteredProjects(projectsList, 'published');
    const archivedProjects = getFilteredProjects(projectsList, 'archived');
    const draftProjects = getFilteredProjects(projectsList, 'draft');

    return (
      <>
        {publishedProjects && publishedProjects.length > 0 &&
          <>
            <ListHeader>
              <HeaderTitle>
                <FormattedMessage {...messages.published} />
              </HeaderTitle>
              <IconTooltip content={<FormattedMessage {...messages.publishedTooltip} />} />

              <Spacer />

              <FeatureFlag name="project_folders">
                <Button
                  linkTo={'/admin/projects/folders/new'}
                >
                  <FormattedMessage {...messages.newProjectFolder} />
                </Button>
              </FeatureFlag>

            </ListHeader>

            <SortableList
              items={projectHolderOrderings}
              onReorder={this.handleReorderHolders}
              className="projects-list e2e-admin-projects-list"
              id="e2e-admin-published-projects-list"
            >
              {({ itemsList, handleDragRow, handleDropRow }) => (
                itemsList.map((item: IProjectHolderOrderingData, index: number) => {
                  if (item.relationships.project_holder.data.type === 'project') {
                    const project = !isNilOrError(publishedProjectsWithoutFolder.projectsList)
                      && publishedProjectsWithoutFolder.projectsList.find(project => project.id === item.relationships.project_holder.data.id);

                    if (!project) return <div />;

                    return (
                      <SortableRow
                        key={item.id}
                        id={item.id}
                        index={index}
                        moveRow={handleDragRow}
                        dropRow={handleDropRow}
                        lastItem={(index === projectHolderOrderings.length - 1)}
                      >
                        <ProjectRow project={project} />
                      </SortableRow>
                    );
                  } else {
                      return (
                        <GetProjectFolder projectFolderId={item.relationships.project_holder.data.id} key={item.relationships.project_holder.data.id}>
                          {projectFolder => isNilOrError(projectFolder) ? null : (
                            <SortableRow
                              id={item.id}
                              index={index}
                              moveRow={handleDragRow}
                              dropRow={handleDropRow}
                              lastItem={(index === projectHolderOrderings.length - 1)}
                            >
                              <FolderRow folder={projectFolder} />
                            </SortableRow>
                          )}
                        </GetProjectFolder>
                      );
                    }
                  }
              ))}
            </SortableList>
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
            <SortableList
              items={draftProjectsWithoutFolder}
              onReorder={this.handleReorderProjects}
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
                    lastItem={(index === draftProjectsWithoutFolder.length - 1)}
                  >
                    <ProjectRow project={project} />
                  </SortableRow>
                ))
              )}
            </SortableList>
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
            <SortableList
              items={archivedProjectsWithoutFolder}
              onReorder={this.handleReorderProjects}
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
                    lastItem={index === archivedProjectsWithoutFolder.length - 1}
                  >
                    <ProjectRow project={project} />
                  </SortableRow>
                ))
              )}
            </SortableList>
          </>
        }
      </>
    );
  }

  return null;
});

const publicationStatuses: PublicationStatus[] = ['published', 'draft', 'archived'];

const Data = adopt<DataProps>({
  projectHolderOrderings: <GetProjectHolderOrderings />,
  publishedProjects: ({ projectHolderOrderings, render }) => {
    const projectIds = isNilOrError(projectHolderOrderings)
      ? []
      : projectHolderOrderings
        .filter(item => item.relationships.project_holder.data.type === 'project')
        .map(item => item.relationships.project_holder.data.id);
    return <GetProjects publicationStatuses={['published']} filteredProjectIds={projectIds} filterCanModerate={true}>{render}</GetProjects>;
  },
  projectsWithoutFolder: <GetProjects publicationStatuses={publicationStatuses} filterCanModerate={true} folderId="nil"/>,
});

export default () => (
  <Data>
    {dataProps => <AdminProjectList {...dataProps} />}
  </Data>
);
