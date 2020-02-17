import React, { memo } from 'react';
import { adopt } from 'react-adopt';

// style
import styled from 'styled-components';

// utils
import { isNilOrError } from 'utils/helperUtils';

// resources
import GetProjects, { GetProjectsChildProps, PublicationStatus } from 'resources/GetProjects';
import GetProjectFolder from 'resources/GetProjectFolder';
import GetProjectHolderOrderings, { GetProjectHolderOrderingsChildProps } from 'resources/GetProjectHolderOrderings';

// components
import { SortableList, SortableRow } from 'components/admin/ResourceList';
import ProjectRow from '../../components/ProjectRow';
import FolderRow from '../../components/FolderRow';
import { ListHeader, HeaderTitle } from '../StyledComponents';
import IconTooltip from 'components/UI/IconTooltip';
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// services
import { IProjectData, reorderProject } from 'services/projects';
import { IProjectHolderOrderingData, reorderProjectHolder } from 'services/projectHolderOrderings';

const Spacer = styled.div`
  flex: 1;
`;

interface DataProps {
  projectsWithoutFolder: GetProjectsChildProps;
  projectHolderOrderings: GetProjectHolderOrderingsChildProps;
}

interface Props extends DataProps { }

function getFilteredProjects(projects: IProjectData[], publicationStatus: PublicationStatus) {
  return projects.filter((project) => {
    return project.attributes.publication_status === publicationStatus;
  });
}

function handleReorderHolders(itemId, newOrder) {
  return function () {
    reorderProjectHolder(itemId, newOrder);
  };
}

function handleReorderProjects(projectId, newOrder) {
  return function () {
    reorderProject(projectId, newOrder);
  };
}

const AdminProjectList = memo<Props>(({ projectsWithoutFolder, projectHolderOrderings }) => {
  let publishedItems: JSX.Element | null = null;
  let itemsWithoutFolder: JSX.Element | null = null;

  if (!isNilOrError(projectHolderOrderings) && projectHolderOrderings.length > 0) {
    publishedItems = (
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

        <SortableList
          items={projectHolderOrderings}
          onReorder={handleReorderHolders}
          className="projects-list e2e-admin-projects-list"
          id="e2e-admin-published-projects-list"
        >
          {({ itemsList, handleDragRow, handleDropRow }) => (
            itemsList.map((item: IProjectHolderOrderingData, index: number) => {
              const holderType = item.relationships.project_holder.data.type;

              if (holderType === 'project') {
                const projectId = item.relationships.project_holder.data.id;
                const project = (
                  !isNilOrError(projectsWithoutFolder) &&
                  projectsWithoutFolder.projectsList &&
                  projectsWithoutFolder.projectsList.length > 0
                )
                ?
                  projectsWithoutFolder.projectsList.find(project => project.id === projectId)
                :
                  null;

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
              } else if (holderType === 'project_folder') {
                  return (
                    <GetProjectFolder
                      projectFolderId={item.relationships.project_holder.data.id}
                      key={item.relationships.project_holder.data.id}
                    >
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
                } else {
                  return <div />;
                }
              }
          ))}
        </SortableList>
      </>
    );
  }

  if (
    !isNilOrError(projectsWithoutFolder) &&
    projectsWithoutFolder.projectsList &&
    projectsWithoutFolder.projectsList.length > 0
  ) {
    const { projectsList } = projectsWithoutFolder;
    const archivedProjectsWithoutFolder = getFilteredProjects(projectsList, 'archived');
    const draftProjectsWithoutFolder = getFilteredProjects(projectsList, 'draft');

    itemsWithoutFolder = (
      <>
        {draftProjectsWithoutFolder && draftProjectsWithoutFolder.length > 0 &&
          <>
            <ListHeader>
              <HeaderTitle>
                <FormattedMessage {...messages.draft} />
              </HeaderTitle>
              <IconTooltip content={<FormattedMessage {...messages.draftTooltip} />} />
            </ListHeader>
            <SortableList
              items={draftProjectsWithoutFolder}
              onReorder={handleReorderProjects}
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
        {archivedProjectsWithoutFolder && archivedProjectsWithoutFolder.length > 0 &&
          <>
            <ListHeader>
              <HeaderTitle>
                <FormattedMessage {...messages.archived} />
              </HeaderTitle>
              <IconTooltip content={<FormattedMessage {...messages.archivedTooltip} />} />
            </ListHeader>
            <SortableList
              items={archivedProjectsWithoutFolder}
              onReorder={handleReorderProjects}
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

  return (
    <>
      {publishedItems}
      {itemsWithoutFolder}
    </>
  );
});

const publicationStatuses: PublicationStatus[] = ['published', 'draft', 'archived'];

const Data = adopt<DataProps>({
  projectHolderOrderings: <GetProjectHolderOrderings />,
  projectsWithoutFolder: <GetProjects publicationStatuses={publicationStatuses} filterCanModerate={true} folderId="nil"/>,
});

export default () => (
  <Data>
    {dataProps => <AdminProjectList {...dataProps} />}
  </Data>
);
