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
import Outlet from 'components/Outlet';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

interface Props {}

const ModeratorProjectList = memo<Props>(() => {
  const adminPublications = useAdminPublications({
    publicationStatusFilter: ['published', 'draft', 'archived'],
    folderId: null,
  });
  const isProjectFoldersEnabled = useFeatureFlag('project_folders');

  const adminPublicationRow = (adminPublication) => {
    if (adminPublication.publicationType === 'project') {
      return <ProjectRow publication={adminPublication} />;
    } else if (
      adminPublication.publicationType === 'folder' &&
      isProjectFoldersEnabled
    ) {
      return (
        <Outlet
          id="app.containers.AdminPage.projects.all.projectsAndFolders.projectFolderRow"
          publication={adminPublication}
        />
      );
    }

    return null;
  };

  if (
    !isNilOrError(adminPublications) &&
    adminPublications.list &&
    adminPublications.list.length > 0
  ) {
    const adminPublicationsList = adminPublications.list;

    if (adminPublicationsList && adminPublicationsList.length > 0) {
      return (
        <>
          <ListHeader>
            <HeaderTitle>
              <FormattedMessage {...messages.existingProjects} />
            </HeaderTitle>
          </ListHeader>

          <List>
            {adminPublicationsList.map((adminPublication, index) => {
              return (
                <Row
                  key={index}
                  id={adminPublication.id}
                  isLastItem={index === adminPublicationsList.length - 1}
                >
                  {adminPublicationRow(adminPublication)}
                </Row>
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
