import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// style
import styled from 'styled-components';
import { SortableRow } from 'components/admin/ResourceList';
import useAdminPublications from 'api/admin_publications/useAdminPublications';
import ProjectFolderRow from '../../projectFolders/components/ProjectFolderRow';
import { PublicationStatus } from 'api/projects/types';
import useAuthUser from 'api/me/useAuthUser';
import FolderChildProjects from './FolderChildProjects';
import { IAdminPublicationData } from 'api/admin_publications/types';

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
  publication: IAdminPublicationData;
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
  isLastItem,
}: Props) => {
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

  const toggleFolder = () => {
    setFolderOpen((folderOpen) => !folderOpen);
  };

  const hasProjects =
    !isNilOrError(folderChildAdminPublications) &&
    folderChildAdminPublications.length > 0;
  const showBottomBorder = isLastItem && !folderOpen;

  const publicationRelation = publication.relationships.publication.data;

  const folderId =
    publicationRelation.type === 'folder' ? publicationRelation.id : undefined;

  return (
    <>
      <StyledSortableRow
        id={id}
        index={index}
        moveRow={moveRow}
        dropRow={dropRow}
        isLastItem={showBottomBorder}
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
          folderId={folderId}
        />
      )}
    </>
  );
};

export default SortableFolderRow;
