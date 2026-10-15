import React from 'react';

import { MiniProjectFolders } from 'api/project_folders_mini/types';

import { PagedQuery } from '../levelGroups';

import FolderTile from './FolderTile';
import LoadMore from './LoadMore';
import TileGrid from './TileGrid';


interface Props {
  query: PagedQuery<MiniProjectFolders>;
}

const FolderTiles = ({ query }: Props) => {
  const folders = query.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <>
      <TileGrid>
        {folders.map((folder) => (
          <FolderTile key={folder.id} folder={folder} />
        ))}
      </TileGrid>
      <LoadMore
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  );
};

export default FolderTiles;
