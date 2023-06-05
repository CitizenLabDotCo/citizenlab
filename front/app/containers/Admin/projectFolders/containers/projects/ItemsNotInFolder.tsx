import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// api
import useUpdateProjectFolderMembership from 'api/projects/useUpdateProjectFolderMembership';

// services
import { PublicationStatus } from 'api/projects/types';

// hooks
import useAdminPublications from 'api/admin_publications/useAdminPublications';
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

  const { data } = useAdminPublications({
    publicationStatusFilter: publicationStatuses,
  });

  const adminPublications = data?.pages.map((page) => page.data).flat();

  const { mutate: updateProjectFolderMembership } =
    useUpdateProjectFolderMembership();
  const [processing, setProcessing] = useState<string[]>([]);

  if (isNilOrError(authUser)) {
    return null;
  }

  const addProjectToFolder =
    (projectFolderId: string) => (projectId: string) => async () => {
      setProcessing([...processing, projectId]);

      updateProjectFolderMembership(
        {
          projectId,
          newProjectFolderId: projectFolderId,
        },
        {
          onSuccess: () => {
            setProcessing(processing.filter((item) => projectId !== item));
          },
        }
      );
    };

  const adminPublicationsThatCanBeAdded = !isNilOrError(adminPublications)
    ? adminPublications.filter(
        (item) =>
          item.relationships.publication.data.type === 'project' &&
          item.attributes.depth === 0
      )
    : null;

  if (
    !isNilOrError(adminPublicationsThatCanBeAdded) &&
    // the length check is needed because an empty array
    // is also truthy, so we won't reach the fallback message
    adminPublicationsThatCanBeAdded.length > 0
  ) {
    return (
      <List>
        <>
          {adminPublicationsThatCanBeAdded.map(
            (adminPublication, index: number) => (
              <Row
                id={adminPublication.id}
                isLastItem={
                  index === adminPublicationsThatCanBeAdded.length - 1
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
                        adminPublication.relationships.publication.data.id
                      ),
                      icon: 'plus-circle',
                    },
                  ]}
                  hideMoreActions
                />
              </Row>
            )
          )}
        </>
      </List>
    );
  }

  return <FormattedMessage {...messages.noProjectsToAdd} />;
};

export default ItemsNotInFolder;
