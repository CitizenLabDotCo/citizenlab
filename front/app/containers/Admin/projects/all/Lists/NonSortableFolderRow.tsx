import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// style
import useAdminPublications, {
  IAdminPublicationContent,
} from 'hooks/useAdminPublications';
import ProjectFolderRow from '../../projectFolders/components/ProjectFolderRow';
import { PublicationStatus } from 'services/projects';
import { Row } from 'components/admin/ResourceList';
import useAuthUser from 'hooks/useAuthUser';
import FolderChildProjects from './FolderChildProjects';
interface Props {
  key: number;
  id: string;
  isLastItem: boolean;
  publication: IAdminPublicationContent;
}

const publicationStatuses: PublicationStatus[] = [
  'draft',
  'published',
  'archived',
];

const SortableFolderRow = ({ key, id, isLastItem, publication }: Props) => {
  const authUser = useAuthUser();
  const [folderOpen, setFolderOpen] = useState(true);

  const toggleFolder = () => {
    setFolderOpen((folderOpen) => !folderOpen);
  };

  const { list: folderChildAdminPublications } = useAdminPublications({
    childrenOfId: publication.relationships.publication.data.id,
    publicationStatusFilter: publicationStatuses,
  });
  const hasProjects =
    !isNilOrError(folderChildAdminPublications) &&
    folderChildAdminPublications.length > 0;

  if (!isNilOrError(authUser)) {
    return (
      <>
        <Row key={key} id={id} isLastItem={isLastItem}>
          <ProjectFolderRow
            publication={publication}
            toggleFolder={toggleFolder}
            folderOpen={folderOpen}
            hasProjects={hasProjects}
          />
        </Row>
        {hasProjects && folderOpen && (
          <FolderChildProjects
            folderChildAdminPublications={folderChildAdminPublications}
            authUser={authUser}
          />
        )}
      </>
    );
  }

  return null;
};

export default SortableFolderRow;
