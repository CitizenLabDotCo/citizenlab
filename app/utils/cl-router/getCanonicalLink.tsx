import React from 'react';
import{ GetTenantLocalesChildProps } from 'resources/GetTenantLocales';
import { replacePathnameLocale } from 'services/locale';

export default function getCanonicalLink(tenantLocales: GetTenantLocalesChildProps) {
  if (Array.isArray(tenantLocales)) {
    const firstTenantLocale = tenantLocales[0];
    return <link rel="canonical" href={`${location.origin}${replacePathnameLocale(location.pathname, firstTenantLocale)}`} />;
  }

  return null;
}
