import React, { memo } from 'react';

// utils
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useAdminPublications from 'hooks/useAdminPublications';
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import { List, Row } from 'components/admin/ResourceList';
import ProjectRow from '../../components/ProjectRow';
import { ListHeader, HeaderTitle } from '../StyledComponents';
import NonSortableFolderRow from './NonSortableFolderRow';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const ModeratorProjectList = memo(() => {
  const { list: rootLevelAdminPublications } = useAdminPublications({
    publicationStatusFilter: ['published', 'draft', 'archived'],
    rootLevelOnly: true,
  });
  const isProjectFoldersEnabled = useFeatureFlag({ name: 'project_folders' });

  if (
    !isNilOrError(rootLevelAdminPublications) &&
    rootLevelAdminPublications &&
    rootLevelAdminPublications.length > 0
  ) {
    if (rootLevelAdminPublications && rootLevelAdminPublications.length > 0) {
      return (
        <>
          <ListHeader>
            <HeaderTitle>
              <FormattedMessage {...messages.existingProjects} />
            </HeaderTitle>
          </ListHeader>

          <List>
            {rootLevelAdminPublications.map((adminPublication, index) => {
              return (
                !isProjectFoldersEnabled ||
                (!adminPublication.relationships.parent.data && (
                  <>
                    {adminPublication.publicationType === 'project' && (
                      <Row
                        key={index}
                        id={adminPublication.id}
                        isLastItem={
                          index === rootLevelAdminPublications.length - 1
                        }
                      >
                        <ProjectRow
                          publication={adminPublication}
                          actions={['manage']}
                          showMoreActions={false}
                        />
                      </Row>
                    )}
                    {adminPublication.publicationType === 'folder' && (
                      <NonSortableFolderRow
                        key={index}
                        id={adminPublication.id}
                        isLastItem={
                          index === rootLevelAdminPublications.length - 1
                        }
                        publication={adminPublication}
                      />
                    )}
                  </>
                ))
              );
            })}
          </List>
        </>
      );
    }
  }

  return null;
});

export default ModeratorProjectList;
