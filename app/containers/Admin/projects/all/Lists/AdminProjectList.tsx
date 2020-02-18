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
import ProjectRow from '../../components/ProjectRow';
import FolderRow from '../../components/FolderRow';
import { ListHeader, HeaderTitle } from '../StyledComponents';
import IconTooltip from 'components/UI/IconTooltip';
import Button from 'components/UI/Button';
import FeatureFlag from 'components/FeatureFlag';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// services
import { IProjectData, reorderProject, getFilteredProjects } from 'services/projects';
import { reorderProjectHolder } from 'services/projectHolderOrderings';
import { IProjectHolderOrderingContent } from 'hooks/useProjectHolderOrderings';

const Spacer = styled.div`
  flex: 1;
`;

interface DataProps {
  projectsWithoutFolder: GetProjectsChildProps;
  projectHolderOrderings: GetProjectHolderOrderingsChildProps;
}

interface Props extends DataProps { }

function handleReorderHolders(itemId, newOrder) {
  reorderProjectHolder(itemId, newOrder);
}

function handleReorderProjects(projectId, newOrder) {
  return function () {
    reorderProject(projectId, newOrder);
  };
}

const AdminProjectList = memo<Props>(({ projectsWithoutFolder, projectHolderOrderings }) => {
  let publishedItems: JSX.Element | null = null;
  let itemsWithoutFolder: JSX.Element | null = null;
  const projectHolderOrderingsList = projectHolderOrderings.list;

  if (!isNilOrError(projectHolderOrderingsList) && projectHolderOrderingsList.length > 0) {
    publishedItems = (
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
              buttonStyle="admin-dark"
            >
              <FormattedMessage {...messages.newProjectFolder} />
            </Button>
          </FeatureFlag>
        </ListHeader>

        <SortableList
          items={projectHolderOrderingsList}
          onReorder={handleReorderHolders}
          className="projects-list e2e-admin-projects-list"
          id="e2e-admin-published-projects-list"
        >
          {({ itemsList, handleDragRow, handleDropRow }) => (
            itemsList.map((item: IProjectHolderOrderingContent, index: number) => {
                return (
                  <SortableRow
                    key={item.id}
                    id={item.id}
                    index={index}
                    moveRow={handleDragRow}
                    dropRow={handleDropRow}
                    lastItem={(index === projectHolderOrderingsList.length - 1)}
                  >
                    {item.projectHolderType === 'project'
                    ? <ProjectRow project={item.projectHolder} />
                    : <FolderRow folder={item.projectHolder} />}
                  </SortableRow>
                );
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

const publicationStatuses: PublicationStatus[] = ['draft', 'archived'];

const Data = adopt<DataProps>({
  projectHolderOrderings: <GetProjectHolderOrderings />,
  projectsWithoutFolder: <GetProjects publicationStatuses={publicationStatuses} folderId="nil" />,
});

export default () => (
  <Data>
    {dataProps => <AdminProjectList {...dataProps} />}
  </Data>
);
