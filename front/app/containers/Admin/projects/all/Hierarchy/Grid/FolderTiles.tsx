import React from 'react';

import { MiniProjectFolders } from 'api/project_folders_mini/types';

import useArrangeGroup, {
  ArrangeGroupContext,
} from '../Arrange/useArrangeGroup';
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
  const { shown, placeOf, group } = useArrangeGroup({
    kind: 'folder',
    items: folders,
    hasMore: query.hasNextPage,
    arrangeable,
  });

  return (
    <>
      <ArrangeGroupContext.Provider value={group}>
        <TileGrid>
          {shown.map((folder) => (
            <FolderTile
              key={folder.id}
              folder={folder}
              place={placeOf(folder)}
            />
          ))}
        </TileGrid>
      </ArrangeGroupContext.Provider>
      <LoadMore
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  );
};

export default FolderTiles;
