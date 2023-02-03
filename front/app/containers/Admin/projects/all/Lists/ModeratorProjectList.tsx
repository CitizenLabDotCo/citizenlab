import React, { memo } from 'react';

// utils
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useAdminPublications from 'hooks/useAdminPublications';
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import { List, Row } from 'components/admin/ResourceList';
import ProjectRow from '../../components/ProjectRow';
import ProjectFolderRow from '../../projectFolders/components/ProjectFolderRow';
import { ListHeader, HeaderTitle } from '../StyledComponents';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

interface Props {}

const ModeratorProjectList = memo<Props>(() => {
  const { list: rootLevelAdminPublications } = useAdminPublications({
    publicationStatusFilter: ['published', 'draft', 'archived'],
    rootLevelOnly: true,
  });
  const isProjectFoldersEnabled = useFeatureFlag({ name: 'project_folders' });

  const adminPublicationRow = (adminPublication) => {
    if (adminPublication.publicationType === 'project') {
      return <ProjectRow publication={adminPublication} />;
    }
    if (adminPublication.publicationType === 'folder') {
      return <ProjectFolderRow publication={adminPublication} />;
    }
    return null;
  };

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
                  <Row
                    key={index}
                    id={adminPublication.id}
                    isLastItem={index === rootLevelAdminPublications.length - 1}
                  >
                    {adminPublicationRow(adminPublication)}
                  </Row>
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
