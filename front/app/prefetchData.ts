import adminPublicationsStatusCountsKeys from 'api/admin_publications_status_counts/keys';
import { fetchStatusCounts } from 'api/admin_publications_status_counts/useAdminPublicationsStatusCounts';
import { GLOBAL_CONTEXT } from 'api/authentication/authentication_requirements/constants';
import { fetchAuthenticationRequirements } from 'api/authentication/authentication_requirements/getAuthenticationRequirements';
import requirementKeys from 'api/authentication/authentication_requirements/keys';
import homepageBuilderKeys from 'api/home_page_layout/keys';
import { fetchHomepageBuilderLayout } from 'api/home_page_layout/useHomepageLayout';
import navbarKeys from 'api/navbar/keys';
import { fetchNavbarItems } from 'api/navbar/useNavbarItems';

import { PUBLICATION_STATUSES } from 'components/ProjectAndFolderCards';

import { queryClient } from 'utils/cl-react-query/queryClient';

const prefetchData = () => {
  queryClient.prefetchQuery({
    queryKey: homepageBuilderKeys.items(),
    queryFn: fetchHomepageBuilderLayout,
  });

  queryClient.prefetchQuery({
    queryKey: navbarKeys.list({}),
    queryFn: () => fetchNavbarItems({}),
  });

  queryClient.prefetchQuery({
    queryKey: requirementKeys.item(GLOBAL_CONTEXT),
    queryFn: () => fetchAuthenticationRequirements(GLOBAL_CONTEXT),
  });

  const statusCountParams = {
    publicationStatusFilter: PUBLICATION_STATUSES,
    rootLevelOnly: true,
    removeNotAllowedParents: true,
  } as const;

  queryClient.prefetchQuery({
    queryKey: adminPublicationsStatusCountsKeys.item(statusCountParams),
    queryFn: () => fetchStatusCounts(statusCountParams),
  });
};

export default prefetchData;
