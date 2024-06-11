import React from 'react';

import { SupportedLocale } from 'typings';

import { isPage } from 'utils/helperUtils';
import { replacePathnameLocale } from 'utils/replacePathnameLocale';

// https://github.com/nfl/react-helmet/issues/279 href comes first!
export default function getAlternateLinks(
  tenantLocales: SupportedLocale[] | undefined
) {
  const pathName = location.pathname;

  if (
    !isPage('admin', pathName) &&
    Array.isArray(tenantLocales) &&
    tenantLocales.length > 1
  ) {
    return tenantLocales.map((loc) => {
      return (
        <link
          href={`${location.origin}${replacePathnameLocale(pathName, loc)}`}
          rel="alternate"
          hrefLang={loc}
          key={loc}
        />
      );
    });
  }

  return null;
}
