import useIdMethods from 'api/id_methods/useIdMethods';
import { getAzureConfig } from 'api/id_methods/utils';

import { useLocation } from 'utils/router';

/*
 * All id methods that should be shown to the user, except FranceConnect (which
 * always gets its own block, separate from the other methods).
 * Azure AD is a special case: it can be configured to be hidden, in which case
 * it's only shown on the hidden admin sign-in path.
 */
const useVisibleIdMethodsExceptFC = () => {
  // A hidden path that will show all methods inc any that are admin only
  const { pathname } = useLocation();
  const showAdminOnlyMethods = pathname.endsWith('/sign-in/admin');
  const { data: idMethods } = useIdMethods();

  const azureAdVisibility = getAzureConfig(idMethods)?.attributes.visibility;
  const azureAdIsVisible = ['show', undefined].includes(azureAdVisibility);
  const azureAdEnabled = azureAdIsVisible || showAdminOnlyMethods;

  return (
    idMethods?.data.filter(({ attributes: { name } }) => {
      if (name === 'franceconnect') return false;
      if (name === 'azureactivedirectory') return azureAdEnabled;
      return true;
    }) ?? []
  );
};

export default useVisibleIdMethodsExceptFC;
