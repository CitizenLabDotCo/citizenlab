import useIdMethods from 'api/id_methods/useIdMethods';
import { isEmployeeSsoMethod } from 'api/id_methods/utils';

import { useLocation } from 'utils/router';

/*
 * All id methods that should be shown to the user, except FranceConnect (which
 * always gets its own block, separate from the other methods).
 * Staff methods (Azure AD, Okta) are a special case: they can be configured to
 * be hidden, in which case they're only shown on the hidden admin sign-in path.
 */
const useVisibleIdMethodsExceptFC = () => {
  // A hidden path that will show all methods inc any that are admin only
  const { pathname } = useLocation();
  const showAdminOnlyMethods = pathname.endsWith('/sign-in/admin');
  const { data: idMethods } = useIdMethods();

  return (
    idMethods?.data.filter((method) => {
      if (method.attributes.name === 'franceconnect') return false;
      if (isEmployeeSsoMethod(method)) {
        const isVisible = ['show', undefined].includes(
          method.attributes.visibility
        );
        return isVisible || showAdminOnlyMethods;
      }
      return true;
    }) ?? []
  );
};

export default useVisibleIdMethodsExceptFC;
