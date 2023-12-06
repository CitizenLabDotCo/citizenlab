import { Locale } from '@citizenlab/cl2-component-library';
import { locales } from 'containers/App/constants';
import { isPage } from 'utils/helperUtils';

export const isIdeaPage = (urlSegments: string[]) => {
  const firstUrlSegment = urlSegments[0];
  const secondUrlSegment = urlSegments[1];
  const lastUrlSegment = urlSegments[urlSegments.length - 1];

  return (
    urlSegments.length === 3 &&
    locales.includes(firstUrlSegment) &&
    secondUrlSegment === 'ideas' &&
    lastUrlSegment !== 'new'
  );
};

export const isInitiativePage = (urlSegments: string[]) => {
  const firstUrlSegment = urlSegments[0];
  const secondUrlSegment = urlSegments[1];
  const lastUrlSegment = urlSegments[urlSegments.length - 1];

  return (
    urlSegments.length === 3 &&
    locales.includes(firstUrlSegment) &&
    secondUrlSegment === 'initiatives' &&
    lastUrlSegment !== 'new'
  );
};

export const isAdminPage = () => {
  return isPage('admin', location.pathname);
};

export const isProjectPage = (urlSegments: string[], locale: Locale) => {
  return !!(
    urlSegments.length === 3 &&
    urlSegments[0] === locale &&
    urlSegments[1] === 'projects'
  );
};
