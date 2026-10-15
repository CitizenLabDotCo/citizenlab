import { useMemo } from 'react';

import useInfiniteProjectFoldersAdmin from 'api/project_folders_mini/useInfiniteProjectFoldersAdmin';
import useInfiniteProjectsMiniAdmin from 'api/projects_mini_admin/useInfiniteProjectsMiniAdmin';
import useSpaces from 'api/spaces/useSpaces';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { usePermission } from 'utils/permissions';

import { PAGE_SIZE } from './constants';
import { getLandingLevel } from './level';

// What sits at the top of the hierarchy for this user. The backend leaves out
// whatever already shows inside a space or folder they can open.
const useRootContents = () => {
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });
  const canListSpaces = usePermission({ item: 'space', action: 'list' });
  const canListFolders = usePermission({
    item: 'project_folder',
    action: 'list_for_admin',
  });

  const spaces = useSpaces({}, { enabled: spacesEnabled && canListSpaces });
  const folders = useInfiniteProjectFoldersAdmin(
    { top_level: true, sort: 'arranged' },
    PAGE_SIZE,
    { enabled: canListFolders }
  );
  const projects = useInfiniteProjectsMiniAdmin(
    { top_level: true, sort: 'arranged' },
    PAGE_SIZE
  );

  const isLoading = spaces.isLoading || folders.isLoading || projects.isLoading;
  const isError = spaces.isError || folders.isError || projects.isError;
  const spaceList = spaces.data?.data;
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
