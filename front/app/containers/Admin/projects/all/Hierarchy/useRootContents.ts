import { useMemo } from 'react';

import useInfiniteProjectFoldersAdmin from 'api/project_folders_mini/useInfiniteProjectFoldersAdmin';
import useInfiniteProjectsMiniAdmin from 'api/projects_mini_admin/useInfiniteProjectsMiniAdmin';
import useSpaces from 'api/spaces/useSpaces';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { usePermission } from 'utils/permissions';

import { PAGE_SIZE } from './constants';
import { getLandingLevel } from './level';
import useProjectSort from './useProjectSort';

// What sits at the top of the hierarchy for this user. The backend leaves out
// whatever already shows inside a space or folder they can open.
const useRootContents = () => {
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });
  const sort = useProjectSort();
  const canListSpaces = usePermission({ item: 'space', action: 'list' });
  const canListFolders = usePermission({
    item: 'project_folder',
    action: 'list_for_admin',
  });

  // The spaces list is shared with other parts of the page, like the project
  // form's space picker. When this user's top level has no spaces, what those
  // parts fetch, or fail to, says nothing about it.
  const showSpaces = spacesEnabled && canListSpaces;
  const spacesQuery = useSpaces({}, { enabled: showSpaces });
  const spaces = showSpaces ? spacesQuery.data : undefined;
  const folders = useInfiniteProjectFoldersAdmin(
    { top_level: true, sort: 'arranged' },
    PAGE_SIZE,
    { enabled: canListFolders }
  );
  const projects = useInfiniteProjectsMiniAdmin(
    { top_level: true, sort },
    PAGE_SIZE
  );

  const isLoading =
    (showSpaces && spacesQuery.isLoading) ||
    folders.isLoading ||
    projects.isLoading;
  const isError =
    (showSpaces && spacesQuery.isError) || folders.isError || projects.isError;
  const spaceList = spaces?.data;
  const firstFolders = folders.data?.pages[0];
  const firstProjects = projects.data?.pages[0];

  // Without all three lists, an empty one may only be one that failed, and
  // landing on its sibling would hide that.
  const landing = useMemo(() => {
    if (isLoading || isError) return undefined;

    return getLandingLevel({
      spaceIds: spaceList?.map((space) => space.id) ?? [],
      folderIds: firstFolders?.data.map((folder) => folder.id) ?? [],
      projectsCount: firstProjects?.meta.total ?? 0,
    });
  }, [isLoading, isError, spaceList, firstFolders, firstProjects]);

  return { spaces, folders, projects, landing, isError };
};

export type RootContents = ReturnType<typeof useRootContents>;

export default useRootContents;
