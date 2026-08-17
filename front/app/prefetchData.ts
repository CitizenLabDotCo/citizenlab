import { GLOBAL_CONTEXT } from 'api/authentication/authentication_requirements/constants';
import { fetchAuthenticationRequirements } from 'api/authentication/authentication_requirements/getAuthenticationRequirements';
import requirementKeys from 'api/authentication/authentication_requirements/keys';
import navbarKeys from 'api/navbar/keys';
import { fetchNavbarItems } from 'api/navbar/useNavbarItems';

import { queryClient } from 'utils/cl-react-query/queryClient';

const prefetchData = () => {
  queryClient.prefetchQuery({
    queryKey: navbarKeys.list({}),
    queryFn: () => fetchNavbarItems({}),
  });

  queryClient.prefetchQuery({
    queryKey: requirementKeys.item(GLOBAL_CONTEXT),
    queryFn: () => fetchAuthenticationRequirements(GLOBAL_CONTEXT),
  });
};

export default prefetchData;
