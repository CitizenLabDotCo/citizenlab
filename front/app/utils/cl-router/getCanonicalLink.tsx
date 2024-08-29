import React from 'react';

import { isPage } from 'utils/helperUtils';
import { removeUrlLocale } from 'utils/removeUrlLocale';

/**
 * Make url without locale the canonical of a certain page.
 * E.g. our URL = https://youth4climate.be/nl-BE/.
 * This function will turn it into the following link element to put in the head element of the page:
 * <link rel="canonical" href="https://youth4climate.be/"/>.
 * This lets Google know it should show 'https://youth4climate.be/' in the search results, not the version with locale
 */
export default function getCanonicalLink() {
  const pathName = location.pathname;
  return !isPage('admin', pathName) ? (
    <link
      rel="canonical"
      href={`${location.origin}${removeUrlLocale(pathName)}`}
    />
  ) : null;
}
