import { useEffect } from 'react';

import { useSearchParams } from 'react-router-dom';

import useAuthUser from 'api/me/useAuthUser';

import { isSuperAdmin } from 'utils/permissions/roles';

/**
 * Hook to check if we should be able to see super_admin (internal only) features in the interface.
 * Super admin mode is enabled by adding ?super_admin to the URL.
 * Once enabled, a cookie is set for 1 day so the param does not need to be repeated.
 * If also logged in, the param can only enable super_admin features if the user is actually a super admin (.govocal.com email).
 */
export default function useSuperAdmin() {
  const [searchParams] = useSearchParams();
  const { data: authUser } = useAuthUser();

  // Multiple possible param names for super admin - people forget the exact one sometimes!
  const hasSuperAdminParam =
    searchParams.has('super_admin') ||
    searchParams.has('super-admin') ||
    searchParams.has('superadmin') ||
    searchParams.has('super_user');

  // Set cookie for 1 day if URL param is present
  useEffect(() => {
    if (hasSuperAdminParam) {
      const expires = new Date();
      expires.setDate(expires.getDate() + 1);
      document.cookie = `super_admin=true; expires=${expires.toUTCString()}; path=/`;
    }
  }, [hasSuperAdminParam]);

  const hasSuperAdminCookie = document.cookie
    .split('; ')
    .some((c) => c === 'super_admin=true');

  if (!authUser) return hasSuperAdminParam || hasSuperAdminCookie;

  // If the user is logged in then they must also be a super admin user
  const userIsAdmin = isSuperAdmin(authUser);
  return userIsAdmin && (hasSuperAdminParam || hasSuperAdminCookie);
}
