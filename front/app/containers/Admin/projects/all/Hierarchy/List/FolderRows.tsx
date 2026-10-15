import React from 'react';

import { MiniProjectFolders } from 'api/project_folders_mini/types';

import { placesIn } from '../Arrange/arrangeTargets';
import { PagedQuery } from '../levelGroups';

import { ColumnKey } from './columns';
import FolderRow from './FolderRow';
import useManagers from './useManagers';

interface Props {
  query: PagedQuery<MiniProjectFolders>;
  columns: ColumnKey[];
  arrangeable: boolean;
}

const FolderRows = ({ query, columns, arrangeable }: Props) => {
  const pages = query.data?.pages ?? [];
  const folders = pages.flatMap((page) => page.data);
  const managersOf = useManagers(pages.flatMap((page) => page.included ?? []));
  const placeAt = arrangeable
    ? placesIn(folders, query.hasNextPage)
    : undefined;

  return (
    <>
      {folders.map((folder, index) => (
        <FolderRow
          key={folder.id}
          folder={folder}
          columns={columns}
          managers={managersOf(folder.relationships.moderators.data)}
          place={placeAt?.(index)}
        />
      ))}
    </>
  );
};

export default FolderRows;
