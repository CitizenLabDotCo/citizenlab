import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// services
import { PublicationStatus } from 'services/projects';
import { updateProjectFolderMembership } from '../../../services/projects';

// hooks
import useAdminPublications from 'hooks/useAdminPublications';
import useAuthUser from 'hooks/useAuthUser';

// localisation
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// components
import { List, Row } from 'components/admin/ResourceList';
import ProjectRow from 'containers/Admin/projects/components/ProjectRow';

const publicationStatuses: PublicationStatus[] = [
  'draft',
  'archived',
  'published',
];

interface Props {
  projectFolderId: string;
}

const ItemsNotInFolder = ({ projectFolderId }: Props) => {
  const authUser = useAuthUser();
  const { list: allPublications } = useAdminPublications({
    publicationStatusFilter: publicationStatuses,
  });
  const [processing, setProcessing] = useState<string[]>([]);

  if (isNilOrError(authUser)) {
    return null;
  }

  const addProjectToFolder = (projectFolderId: string) => (
    projectId: string
  ) => async () => {
    setProcessing([...processing, projectId]);
    await updateProjectFolderMembership(projectId, projectFolderId);
    setProcessing(processing.filter((item) => projectId !== item));
  };

  const adminPublicationsThatCanBeAddedToFolder = !isNilOrError(allPublications)
    ? allPublications.filter(
        (item) =>
          item.publicationType === 'project' && item.attributes.depth === 0
      )
    : null;

  if (!isNilOrError(adminPublicationsThatCanBeAddedToFolder)) {
    <List>
      <>
        {adminPublicationsThatCanBeAddedToFolder.map(
          (adminPublication, index: number) => (
            <Row
              id={adminPublication.id}
              isLastItem={
                index === adminPublicationsThatCanBeAddedToFolder.length - 1
              }
              key={adminPublication.id}
            >
              <ProjectRow
                publication={adminPublication}
                actions={[
                  {
                    buttonContent: (
                      <FormattedMessage {...messages.addToFolder} />
                    ),
                    handler: addProjectToFolder(projectFolderId),
                    processing: processing.includes(
                      adminPublication.publicationId
                    ),
                    icon: 'plus-circle',
                  },
                ]}
              />
            </Row>
          )
        )}
      </>
    </List>;
  }

  return <FormattedMessage {...messages.noProjectsToAdd} />;
};

export default ItemsNotInFolder;
