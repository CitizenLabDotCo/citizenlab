import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

// Where a project sits: "Space › Folder", or less when it isn't in one. The
// space is left out when spaces are off.
const useProjectPath = () => {
  const localize = useLocalize();
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });

  return (project: ProjectMiniAdminData) => {
    const { space_title_multiloc, folder_title_multiloc } = project.attributes;

    return [spacesEnabled && space_title_multiloc, folder_title_multiloc]
      .flatMap((title) => (title ? [localize(title)] : []))
      .join(' › ');
  };
};

export default useProjectPath;
