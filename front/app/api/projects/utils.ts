import { RouteType } from 'routes';

import adminPublicationsKeys from 'api/admin_publications/keys';
import adminPublicationsStatusCountsKeys from 'api/admin_publications_status_counts/keys';
import areasKeys from 'api/areas/keys';
import globalTopicsKeys from 'api/global_topics/keys';
import meKeys from 'api/me/keys';
import projectFoldersKeys from 'api/project_folders/keys';
import publicationRecipientCountKeys from 'api/project_publication_recipient_count/keys';
import projectsMiniAdminKeys from 'api/projects_mini_admin/keys';
import spacesKeys from 'api/spaces/keys';

import { queryClient } from 'utils/cl-react-query/queryClient';

import projectsKeys from './keys';

export function getProjectUrl(slug: string): RouteType {
  return `/projects/${slug}`;
}

export const invalidateOnCRUD = () => {
  queryClient.invalidateQueries({ queryKey: projectsKeys.all() });
  queryClient.invalidateQueries({ queryKey: globalTopicsKeys.lists() });
  queryClient.invalidateQueries({ queryKey: areasKeys.lists() });
  queryClient.invalidateQueries({
    queryKey: adminPublicationsKeys.all(),
  });
  queryClient.invalidateQueries({
    queryKey: adminPublicationsStatusCountsKeys.items(),
  });
  queryClient.invalidateQueries({ queryKey: meKeys.all() });
  queryClient.invalidateQueries({
    queryKey: projectsMiniAdminKeys.lists(),
  });
  queryClient.invalidateQueries({
    queryKey: projectFoldersKeys.all(),
  });
  queryClient.invalidateQueries({
    queryKey: spacesKeys.all(),
  });
  queryClient.invalidateQueries({
    queryKey: publicationRecipientCountKeys.all(),
  });
};
