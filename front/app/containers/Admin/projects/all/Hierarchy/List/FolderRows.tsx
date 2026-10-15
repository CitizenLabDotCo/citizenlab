import React from 'react';

import { MiniProjectFolders } from 'api/project_folders_mini/types';

import { PagedQuery } from '../levelGroups';

import { ColumnKey } from './columns';
import FolderRow from './FolderRow';
import useManagers from './useManagers';

interface Props {
  query: PagedQuery<MiniProjectFolders>;
  columns: ColumnKey[];
}

const FolderRows = ({ query, columns }: Props) => {
  const pages = query.data?.pages ?? [];
  const managersOf = useManagers(pages.flatMap((page) => page.included ?? []));

  return (
    <>
      {pages
        .flatMap((page) => page.data)
        .map((folder) => (
          <FolderRow
            key={folder.id}
            folder={folder}
            columns={columns}
            managers={managersOf(folder.relationships.moderators.data)}
          />
        ))}
    </>
  );
};

export default FolderRows;
