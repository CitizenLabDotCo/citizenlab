import React, { Fragment } from 'react';

import { InfiniteData } from '@tanstack/react-query';

import { IAdminPublications } from 'api/admin_publications/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { List, Row } from 'components/admin/ResourceList';

import { useIntl } from 'utils/cl-intl';

import { ActiveTab } from '..';
import ProjectRow from '../../components/ProjectRow';
import messages from '../messages';

import NonSortableFolderRow from './NonSortableFolderRow';

const NonSortableProjectList = ({
  adminPublications,
  search,
  activeTab,
}: {
  adminPublications: InfiniteData<IAdminPublications> | undefined;
  search?: string;
  activeTab: ActiveTab;
}) => {
  const { formatMessage } = useIntl();
  const rootLevelAdminPublications = adminPublications?.pages
    .map((page) => page.data)
    .flat();

  const isProjectFoldersEnabled = useFeatureFlag({ name: 'project_folders' });

  return (
    <>
      {rootLevelAdminPublications?.length === 0 && (
        <p>{formatMessage(messages.noProjectsFound)}</p>
      )}
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
                    showParent={!(activeTab === 'all' && !search)}
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
                    search={search}
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
