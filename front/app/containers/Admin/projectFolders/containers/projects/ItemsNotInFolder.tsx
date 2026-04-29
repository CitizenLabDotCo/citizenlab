import React, { useState } from 'react';

import useAdminPublications from 'api/admin_publications/useAdminPublications';
import useAuthUser from 'api/me/useAuthUser';
import { IProjectFolder } from 'api/project_folders/types';
import { PublicationStatus } from 'api/projects/types';
import useUpdateProjectFolderMembership from 'api/projects/useUpdateProjectFolderMembership';
import useInfiniteProjectsMiniAdmin from 'api/projects_mini_admin/useInfiniteProjectsMiniAdmin';

import ProjectRow from 'containers/Admin/projects/_shared/components/ProjectRow';

import { List, Row } from 'components/admin/ResourceList';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

// localisation
import messages from '../messages';

import { getAdminPublicationsThatCanBeAdded } from './utils';

const publicationStatuses: PublicationStatus[] = [
  'draft',
  'archived',
  'published',
];

interface Props {
  folder: IProjectFolder;
}

const ItemsNotInFolder = ({ folder }: Props) => {
  const projectFolderId = folder.data.id;
  const spaceId = folder.data.attributes.space_id;
  const { data: authUser } = useAuthUser();

  const { data: adminPubsData } = useAdminPublications({
    publicationStatusFilter: publicationStatuses,
  });
  const { data: projectsData } = useInfiniteProjectsMiniAdmin({
    sort: 'alphabetically_asc',
  });

  const adminPublications = adminPubsData?.pages
    .map((page) => page.data)
    .flat();
  const projects = projectsData?.pages.map((page) => page.data).flat();

  const { mutate: updateProjectFolderMembership } =
    useUpdateProjectFolderMembership();
  const [processing, setProcessing] = useState<string[]>([]);

  if (!authUser) {
    return null;
  }

  const addProjectToFolder = (projectId: string) => async () => {
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

  const adminPublicationsThatCanBeAdded = getAdminPublicationsThatCanBeAdded(
    spaceId,
    adminPublications,
    projects,
    authUser
  );

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
                      handler: addProjectToFolder,
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
