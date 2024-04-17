import React, { Fragment } from 'react';

import { useLocation } from 'react-router-dom';

import useAdminPublications from 'api/admin_publications/useAdminPublications';
import { PublicationStatus } from 'api/projects/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { List, Row } from 'components/admin/ResourceList';

import ProjectRow from '../../components/ProjectRow';

import NonSortableFolderRow from './NonSortableFolderRow';

const NonSortableProjectList = ({
  publicationStatusFilter,
  filter_can_moderate,
}: {
  publicationStatusFilter: PublicationStatus[];
  filter_can_moderate?: boolean;
}) => {
  const { pathname } = useLocation();
  const { data } = useAdminPublications({
    publicationStatusFilter,
    rootLevelOnly: true,
    onlyProjects: !pathname.endsWith('admin/projects'),
    filter_can_moderate,
  });

  const rootLevelAdminPublications = data?.pages
    .map((page) => page.data)
    .flat();

  const isProjectFoldersEnabled = useFeatureFlag({ name: 'project_folders' });

  return (
    <>
      {rootLevelAdminPublications?.length === 0 && <p>No projects found</p>}
      <List>
        {rootLevelAdminPublications?.map((adminPublication, index) => {
          const adminPublicationId = adminPublication.id;
          const isLastItem = rootLevelAdminPublications.length - 1 === index;

          return (
            <Fragment key={adminPublicationId}>
              {adminPublication.relationships.publication.data.type ===
                'project' && (
                <Row id={adminPublicationId} isLastItem={isLastItem}>
                  <ProjectRow
                    publication={adminPublication}
                    actions={['manage']}
                  />
                </Row>
              )}
              {isProjectFoldersEnabled &&
                adminPublication.relationships.publication.data.type ===
                  'folder' && (
                  <NonSortableFolderRow
                    id={adminPublicationId}
                    isLastItem={isLastItem}
                    publication={adminPublication}
                    publicationStatuses={publicationStatusFilter}
                  />
                )}
            </Fragment>
          );
        })}
      </List>
    </>
  );
};

export default NonSortableProjectList;
