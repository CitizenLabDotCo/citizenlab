export type Level =
  | { kind: 'root' }
  | { kind: 'space'; id: string }
  | { kind: 'folder'; id: string };

// The projects a level holds, all the way down, as finder params.
export const getProjectScope = (level: Level) => {
  switch (level.kind) {
    case 'root':
      return {};
    case 'space':
      return { space_ids: [level.id] };
    case 'folder':
      return { folder_ids: [level.id] };
  }
};

type RootCounts = {
  spaceIds: string[];
  folderIds: string[];
  projectsCount: number;
};

// Where someone lands without a space or folder in the URL. When the top level
// holds a single space or a single folder and nothing else, they land inside
// it: a level with one tile is a click with nothing to choose.
export const getLandingLevel = ({
  spaceIds,
  folderIds,
  projectsCount,
}: RootCounts): Level => {
  const onlySpace =
    spaceIds.length === 1 && folderIds.length === 0 && projectsCount === 0;
  if (onlySpace) return { kind: 'space', id: spaceIds[0] };

  const onlyFolder =
    spaceIds.length === 0 && folderIds.length === 1 && projectsCount === 0;
  if (onlyFolder) return { kind: 'folder', id: folderIds[0] };

  return { kind: 'root' };
};

export const getLevel = (
  search: { space_id?: string; folder_id?: string },
  landing: Level
): Level => {
  if (search.folder_id) return { kind: 'folder', id: search.folder_id };
  if (search.space_id) return { kind: 'space', id: search.space_id };
  return landing;
};
