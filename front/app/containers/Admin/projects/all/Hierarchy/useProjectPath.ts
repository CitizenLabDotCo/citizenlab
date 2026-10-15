import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

// The level a path starts from.
export type PathFrom = 'root' | 'space';

// Where a project sits: "Space › Folder", or less when it isn't in one. The
// space is left out when spaces are off, or when the path starts inside it.
const useProjectPath = () => {
  const localize = useLocalize();
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });

  return (project: ProjectMiniAdminData, from: PathFrom) => {
    const { space_title_multiloc, folder_title_multiloc } = project.attributes;
    const showSpace = spacesEnabled && from === 'root';

    return [showSpace && space_title_multiloc, folder_title_multiloc]
      .flatMap((title) => (title ? [localize(title)] : []))
      .join(' › ');
  };
};

export default useProjectPath;
