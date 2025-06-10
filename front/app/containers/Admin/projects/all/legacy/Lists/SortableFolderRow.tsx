import React, { useState } from 'react';

import styled from 'styled-components';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useAdminPublications from 'api/admin_publications/useAdminPublications';
import useAuthUser from 'api/me/useAuthUser';
import { PublicationStatus } from 'api/projects/types';

import SortableRow from 'components/admin/ResourceList/SortableRow';

import { isNilOrError } from 'utils/helperUtils';

import ProjectFolderRow from '../../../projectFolders/components/ProjectFolderRow';

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
  publication: IAdminPublicationData;
  search?: string;
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

  const [folderOpen, setFolderOpen] = useState(false);

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
          isLastFolder={isLastItem}
        />
      )}
    </>
  );
};

export default SortableFolderRow;
