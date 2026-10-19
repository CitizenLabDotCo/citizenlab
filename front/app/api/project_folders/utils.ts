import adminPublicationsKeys from 'api/admin_publications/keys';
import adminPublicationsStatusCountsKeys from 'api/admin_publications_status_counts/keys';
import projectFoldersMiniKeys from 'api/project_folders_mini/keys';
import projectsKeys from 'api/projects/keys';
import projectsMiniAdminKeys from 'api/projects_mini_admin/keys';
import spacesKeys from 'api/spaces/keys';

import { queryClient } from 'utils/cl-react-query/queryClient';

import projectFoldersKeys from './keys';

export const invalidateOnCRUD = () => {
  queryClient.invalidateQueries({
    queryKey: projectFoldersKeys.lists(),
  });
  queryClient.invalidateQueries({
    queryKey: projectFoldersMiniKeys.lists(),
  });
  queryClient.invalidateQueries({
    queryKey: projectsKeys.lists(),
  });
  // The admin project list shows the space each project's folder is in.
  queryClient.invalidateQueries({
    queryKey: projectsMiniAdminKeys.lists(),
  });
  queryClient.invalidateQueries({
    queryKey: adminPublicationsKeys.all(),
  });
  queryClient.invalidateQueries({
    queryKey: adminPublicationsStatusCountsKeys.items(),
  });
  queryClient.invalidateQueries({
    queryKey: spacesKeys.all(),
  });
};
