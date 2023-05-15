import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// style
import useAdminPublications, {
  IAdminPublicationContent,
} from 'hooks/useAdminPublications';
import ProjectFolderRow from '../../projectFolders/components/ProjectFolderRow';
import { PublicationStatus } from 'api/projects/types';
import { Row } from 'components/admin/ResourceList';
import useAuthUser from 'hooks/useAuthUser';
import FolderChildProjects from './FolderChildProjects';

export interface Props {
  id: string;
  isLastItem: boolean;
  publication: IAdminPublicationContent;
}

const publicationStatuses: PublicationStatus[] = [
  'draft',
  'published',
  'archived',
];

const NonSortableFolderRow = ({ id, isLastItem, publication }: Props) => {
  const authUser = useAuthUser();
  const { list: folderChildAdminPublications } = useAdminPublications({
    childrenOfId: publication.relationships.publication.data.id,
    publicationStatusFilter: publicationStatuses,
  });
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
        />
      )}
    </>
  );
};

export default NonSortableFolderRow;
