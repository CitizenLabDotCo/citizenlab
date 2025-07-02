import React, { useState } from 'react';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useAdminPublications from 'api/admin_publications/useAdminPublications';
import useAuthUser from 'api/me/useAuthUser';

import { Row } from 'components/admin/ResourceList';

import ProjectFolderRow from '../../../projectFolders/components/ProjectFolderRow';

import FolderChildProjects from './FolderChildProjects';

export interface Props {
  id: string;
  isLastItem: boolean;
  publication: IAdminPublicationData;
  search?: string;
}

const NonSortableFolderRow = ({
  id,
  isLastItem,
  publication,
  search,
}: Props) => {
  const { data: authUser } = useAuthUser();

  const { data } = useAdminPublications({
    childrenOfId: publication.relationships.publication.data.id,
    publicationStatusFilter: ['draft', 'published', 'archived'],
  });

  const folderChildAdminPublications = data?.pages
    .map((page) => page.data)
    .flat();

  const [folderOpen, setFolderOpen] = useState(false);

  if (!authUser) {
    return null;
  }

  const showProjects =
    !!folderChildAdminPublications &&
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    folderChildAdminPublications?.length > 0 &&
    !search;

  const toggleFolder = () => {
    setFolderOpen((folderOpen) => !folderOpen);
  };
  const showBottomBorder = isLastItem && !folderOpen;

  const publicationRelation = publication.relationships.publication.data;

  const folderId =
    publicationRelation.type === 'folder' ? publicationRelation.id : undefined;
  return (
    <>
      <Row id={id} isLastItem={showBottomBorder}>
        <ProjectFolderRow
          publication={publication}
          toggleFolder={toggleFolder}
          isFolderOpen={folderOpen}
          hasProjects={showProjects}
        />
      </Row>
      {showProjects && folderOpen && (
        <FolderChildProjects
          folderChildAdminPublications={folderChildAdminPublications}
          folderId={folderId}
          isLastFolder={isLastItem}
        />
      )}
    </>
  );
};

export default NonSortableFolderRow;
