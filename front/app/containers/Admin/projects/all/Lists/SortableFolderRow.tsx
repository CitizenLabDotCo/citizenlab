import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// style
import styled from 'styled-components';
import { SortableRow } from 'components/admin/ResourceList';
import useAdminPublications, {
  IAdminPublicationContent,
} from 'hooks/useAdminPublications';
import ProjectFolderRow from '../../projectFolders/components/ProjectFolderRow';
import { PublicationStatus } from 'services/projects';
import useAuthUser from 'hooks/useAuthUser';
import FolderChildProjects from './FolderChildProjects';

const StyledSortableRow = styled(SortableRow)`
  & .sortablerow-draghandle {
    align-self: flex-start;
  }
`;

interface Props {
  id: string;
  index: number;
  moveRow: (fromIndex: number, toIndex: number) => void;
  dropRow: (itemId: string, toIndex: number) => void;
  isLastItem: boolean;
  publication: IAdminPublicationContent;
}

const publicationStatuses: PublicationStatus[] = [
  'draft',
  'published',
  'archived',
];

const SortableFolderRow = ({
  id,
  index,
  moveRow,
  dropRow,
  publication,
}: Props) => {
  const authUser = useAuthUser();
  const { list: folderChildAdminPublications } = useAdminPublications({
    childrenOfId: publication.relationships.publication.data.id,
    publicationStatusFilter: publicationStatuses,
  });
  const [folderOpen, setFolderOpen] = useState(true);

  if (isNilOrError(authUser)) {
    return null;
  }

  const toggleFolder = () => {
    setFolderOpen((folderOpen) => !folderOpen);
  };

  const hasProjects =
    !isNilOrError(folderChildAdminPublications) &&
    folderChildAdminPublications.length > 0;

  return (
    <>
      <StyledSortableRow
        id={id}
        index={index}
        moveRow={moveRow}
        dropRow={dropRow}
      >
        <ProjectFolderRow
          publication={publication}
          toggleFolder={toggleFolder}
          isFolderOpen={folderOpen}
          hasProjects={hasProjects}
        />
      </StyledSortableRow>
      {hasProjects && folderOpen && (
        <FolderChildProjects
          folderChildAdminPublications={folderChildAdminPublications}
          authUser={authUser}
        />
      )}
    </>
  );
};

export default SortableFolderRow;
