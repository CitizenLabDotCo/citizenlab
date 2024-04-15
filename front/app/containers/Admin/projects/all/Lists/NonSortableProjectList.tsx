import React, { memo, Fragment } from 'react';

import useAdminPublications from 'api/admin_publications/useAdminPublications';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { List, Row } from 'components/admin/ResourceList';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import ProjectRow from '../../components/ProjectRow';
import messages from '../messages';
import { ListHeader, HeaderTitle } from '../StyledComponents';

import NonSortableFolderRow from './NonSortableFolderRow';

const NonSortableProjectList = memo(() => {
  const { data } = useAdminPublications({
    publicationStatusFilter: ['published', 'draft', 'archived'],
    rootLevelOnly: true,
    moderator: true,
  });

  const rootLevelAdminPublications = data?.pages
    .map((page) => page.data)
    .flat();

  const isProjectFoldersEnabled = useFeatureFlag({ name: 'project_folders' });

  if (
    !isNilOrError(rootLevelAdminPublications) &&
    rootLevelAdminPublications &&
    rootLevelAdminPublications.length > 0
  ) {
    return (
      <>
        <ListHeader>
          <HeaderTitle>
            <FormattedMessage {...messages.existingProjects} />
          </HeaderTitle>
        </ListHeader>

        <List>
          {rootLevelAdminPublications.map((adminPublication, index) => {
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
                    />
                  )}
              </Fragment>
            );
          })}
        </List>
      </>
    );
  }

  return null;
});

export default NonSortableProjectList;
