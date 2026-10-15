import useProjectFolderById from 'api/project_folders/useProjectFolderById';
import useSpace from 'api/spaces/useSpace';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { usePermission } from 'utils/permissions';

import { Level } from './level';

export type SubLevel = Exclude<Level, { kind: 'root' }>;

// The space or folder a level shows, and the space above a folder when this
// user can open it.
const useLevelDetails = (level: SubLevel) => {
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });

  const { data: folder } = useProjectFolderById(
    level.kind === 'folder' ? level.id : undefined
  );
  // A folder can keep its space after spaces are turned off. The top level
  // then lists the folder itself, so its space isn't a level to go back to.
  const folderSpaceId = spacesEnabled
    ? folder?.data.attributes.space_id
    : undefined;
  const spaceId = level.kind === 'space' ? level.id : folderSpaceId;
  const canOpenSpace = usePermission({
    item: 'space',
    action: 'manage_projects_and_folders',
    context: { spaceId },
  });
  const { data: space } = useSpace(canOpenSpace ? spaceId : undefined);

  return { folder: folder?.data, space: space?.data };
};

export default useLevelDetails;
