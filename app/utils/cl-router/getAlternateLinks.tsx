import React from 'react';
import{ GetTenantLocalesChildProps } from 'resources/GetTenantLocales';
import { Locale } from 'typings';

function replaceLocale(pathname: string, locale: Locale) {
  const localeRegexp = /^\/([a-zA-Z]{2,3}-[a-zA-Z]{2,3}?|en)\/([\S+]*)/;
  const matches = pathname.match(localeRegexp);
  return matches && `/${locale}/${matches[2]}`;
}

// https://github.com/nfl/react-helmet/issues/279 href comes first!
export default function getAlternateLinks(tenantLocales: GetTenantLocalesChildProps, location) {
  if (Array.isArray(tenantLocales)) {
    return tenantLocales.map(loc => {
      return <link href={`${location.origin}${replaceLocale(location.pathname, loc)}`} rel="alternate" hrefLang={loc} key={loc} />;
    });
  }

  return null;
}
