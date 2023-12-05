import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// style
import useAdminPublications from 'api/admin_publications/useAdminPublications';
import ProjectFolderRow from '../../projectFolders/components/ProjectFolderRow';
import { PublicationStatus } from 'api/projects/types';
import { Row } from 'components/admin/ResourceList';
import useAuthUser from 'api/me/useAuthUser';
import FolderChildProjects from './FolderChildProjects';
import { IAdminPublicationData } from 'api/admin_publications/types';

export interface Props {
  id: string;
  isLastItem: boolean;
  publication: IAdminPublicationData;
}

const publicationStatuses: PublicationStatus[] = [
  'draft',
  'published',
  'archived',
];

const NonSortableFolderRow = ({ id, isLastItem, publication }: Props) => {
  const { data: authUser } = useAuthUser();

  const { data } = useAdminPublications({
    childrenOfId: publication.relationships.publication.data.id,
    publicationStatusFilter: publicationStatuses,
  });

  const folderChildAdminPublications = data?.pages
    .map((page) => page.data)
    .flat();

  const [folderOpen, setFolderOpen] = useState(true);

  if (isNilOrError(authUser)) {
    return null;
  }

  const hasProjects =
    !isNilOrError(folderChildAdminPublications) &&
    folderChildAdminPublications.length > 0;

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
          hasProjects={hasProjects}
        />
      </Row>
      {hasProjects && folderOpen && (
        <FolderChildProjects
          folderChildAdminPublications={folderChildAdminPublications}
          folderId={folderId}
        />
      )}
    </>
  );
};

export default NonSortableFolderRow;
