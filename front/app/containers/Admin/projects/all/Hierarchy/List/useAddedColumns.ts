import { useState } from 'react';

import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { useSearch } from 'utils/router';

import { readStored, writeStored } from '../storage';

import { AddableColumn, addableColumns } from './columns';

const STORAGE_KEY = 'admin_projects_list_columns';

const isAddableColumn = (value: unknown): value is AddableColumn =>
  addableColumns.some((column) => column === value);

const readStoredColumns = (): AddableColumn[] => {
  try {
    const parsed: unknown = JSON.parse(readStored(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isAddableColumn) : [];
  } catch {
    return [];
  }
};

// The extra list columns stay as the user last left them in this browser. The
// URL wins when it has some, so a shared link shows the same columns. Every
// change writes the URL, even an empty list, so the stored value only matters
// on arrival.
const useAddedColumns = () => {
  const { cols } = useSearch({ from: '/$locale/admin/projects/' });
  const [stored] = useState(readStoredColumns);
  const added = cols ?? stored;

  const toggleColumn = (column: AddableColumn) => {
    const next = added.includes(column)
      ? added.filter((key) => key !== column)
      : addableColumns.filter((key) => key === column || added.includes(key));

    writeStored(STORAGE_KEY, JSON.stringify(next));
    updateSearchParams({ cols: next });
  };

  return { added, toggleColumn };
};

export default useAddedColumns;
