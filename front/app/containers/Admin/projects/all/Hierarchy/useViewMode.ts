import { useState } from 'react';

import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { useSearch } from 'utils/router';

import { readStored, writeStored } from './storage';

export type ViewMode = 'grid' | 'list' | 'calendar';

const STORAGE_KEY = 'admin_projects_view';

const isViewMode = (value: unknown): value is ViewMode =>
  value === 'grid' || value === 'list' || value === 'calendar';

// The view stays as the user last left it in this browser. The URL wins when
// it has one, so a shared link opens in the view it was shared from. Every
// change writes the URL, so the stored value only matters on arrival.
const useViewMode = () => {
  const { view_mode } = useSearch({ from: '/$locale/admin/projects/' });
  const [stored] = useState(() => readStored(STORAGE_KEY));

  const viewMode: ViewMode = isViewMode(view_mode)
    ? view_mode
    : isViewMode(stored)
    ? stored
    : 'grid';

  const setViewMode = (mode: ViewMode) => {
    writeStored(STORAGE_KEY, mode);
    updateSearchParams({ view_mode: mode });
  };

  return { viewMode, setViewMode };
};

export default useViewMode;
