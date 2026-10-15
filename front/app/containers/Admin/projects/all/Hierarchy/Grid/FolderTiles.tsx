import React from 'react';

import { MiniProjectFolders } from 'api/project_folders_mini/types';

import { placesIn } from '../Arrange/arrangeTargets';
import { PagedQuery } from '../levelGroups';

import FolderTile from './FolderTile';
import LoadMore from './LoadMore';
import TileGrid from './TileGrid';

interface Props {
  query: PagedQuery<MiniProjectFolders>;
  arrangeable: boolean;
}

const FolderTiles = ({ query, arrangeable }: Props) => {
  const folders = query.data?.pages.flatMap((page) => page.data) ?? [];
  const placeAt = arrangeable
    ? placesIn(folders, query.hasNextPage)
    : undefined;

  return (
    <>
      <TileGrid>
        {folders.map((folder, index) => (
          <FolderTile
            key={folder.id}
            folder={folder}
            place={placeAt?.(index)}
          />
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
