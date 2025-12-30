import { useEffect } from 'react';

import { useSearchParams } from 'react-router-dom';

/**
 * Hook to check if the user has super admin access.
 * Super admin mode is enabled by adding ?super_admin to the URL.
 * Once enabled, a cookie is set for 1 day so the param doesn't need to be repeated.
 */
export default function useSuperAdmin() {
  const [searchParams] = useSearchParams();
  const hasSuperAdminParam = searchParams.has('super_admin');

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

  return hasSuperAdminParam || hasSuperAdminCookie;
}
