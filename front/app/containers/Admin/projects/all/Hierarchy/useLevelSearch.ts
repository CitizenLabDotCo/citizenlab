import { useSearch } from 'utils/router';

import { Level } from './level';

// The search params for a link to another level. The view and the list columns
// carry over; search and filters don't, as they belong to the level they were
// set on.
const useLevelSearch = () => {
  const { view_mode, cols } = useSearch({ from: '/$locale/admin/projects/' });

  return (level: Level) => ({
    view_mode,
    cols,
    space_id: level.kind === 'space' ? level.id : undefined,
    folder_id: level.kind === 'folder' ? level.id : undefined,
  });
};

export default useLevelSearch;
