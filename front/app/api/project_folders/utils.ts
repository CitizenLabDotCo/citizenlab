import adminPublicationsKeys from 'api/admin_publications/keys';
import adminPublicationsStatusCountsKeys from 'api/admin_publications_status_counts/keys';
import projectFoldersMiniKeys from 'api/project_folders_mini/keys';
import projectsKeys from 'api/projects/keys';
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
