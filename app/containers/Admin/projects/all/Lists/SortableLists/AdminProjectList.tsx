import React, { memo } from 'react';
import { adopt } from 'react-adopt';

// utils
import { isNilOrError } from 'utils/helperUtils';

// resources
import GetProjects, { GetProjectsChildProps, PublicationStatus } from 'resources/GetProjects';
import GetProjectHolderOrderings, { GetProjectHolderOrderingsChildProps } from 'resources/GetProjectHolderOrderings';

// components
import { SortableList, SortableRow } from 'components/admin/ResourceList';
import ProjectRow from '../../../components/ProjectRow';
import { ListHeader, HeaderTitle } from '../../StyledComponents';
import IconTooltip from 'components/UI/IconTooltip';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

// services
import { IProjectData, reorderProject } from 'services/projects';
import { IProjectHolderOrderingData, reorderProjectHolder } from 'services/projectHolderOrderings';

interface DataProps {
  projects: GetProjectsChildProps;
  projectHolderOrderings: GetProjectHolderOrderingsChildProps;
}

interface Props extends DataProps {}

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

const AdminProjectList = memo<Props>(({ projects, projectHolderOrderings }) => {
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
        {!isNilOrError(projectHolderOrderings) && projectHolderOrderings.length > 0 &&
          <>
            <ListHeader>
              <HeaderTitle>
                <FormattedMessage {...messages.published} />
              </HeaderTitle>
              <IconTooltip content={<FormattedMessage {...messages.publishedTooltip} />} />
            </ListHeader>

            <SortableList
              items={projectHolderOrderings}
              onReorder={handleReorderHolders}
              className="projects-list e2e-admin-projects-list"
              id="e2e-admin-published-projects-list"
            >
              {({ itemsList, handleDragRow, handleDropRow }) => (
                itemsList.map((item: IProjectHolderOrderingData, index: number) => {
                  const project = publishedProjects.find(project => project.id === item.relationships.project_holder.data.id);

                  if (project) {
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
                  }

                  return <div key={index} />;
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
              items={draftProjects}
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
                    lastItem={(index === draftProjects.length - 1)}
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
              items={archivedProjects}
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
                    lastItem={index === archivedProjects.length - 1}
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
  projects: <GetProjects publicationStatuses={publicationStatuses} filterCanModerate={true} />,
  projectHolderOrderings: <GetProjectHolderOrderings />,
});

export default () => (
  <Data>
    {dataProps => <AdminProjectList {...dataProps} />}
  </Data>
);
