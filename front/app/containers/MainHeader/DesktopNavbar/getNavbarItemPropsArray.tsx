import React from 'react';

// services
import { INavbarItem, TDefaultNavbarItemCode } from 'services/navbar';
import { IPageData } from 'services/pages';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';

const CODE_TO_LINK_MAP: Record<TDefaultNavbarItemCode, string> = {
  home: '/',
  projects: '/projects',
  all_input: '/ideas',
  proposals: '/initiatives',
  events: '/events',
};

const LINK_TO_MESSAGE_MAP = {
  '/': messages.pageOverview,
  '/ideas': messages.pageInputs,
  '/initiatives': messages.pageInitiatives,
  '/events': messages.pageEvents,
  '/pages/information': messages.pageInformation,
  '/pages/faq': messages.pageFaq,
};

const getPageSlug = (pagesById: Record<string, IPageData>, pageId: string) => {
  const page = pagesById[pageId];
  return `/pages/${page.attributes.slug}`;
};

export default function getNavbarItemPropsArray(
  navbarItems: INavbarItem[],
  pages: IPageData[],
  customNavbarEnabled: boolean
) {
  const pagesById = pages.reduce((acc, curr) => {
    acc[curr.id] = curr;
    return acc;
  }, {});

  return navbarItems.map((navbarItem) => {
    const linkTo: string = navbarItem.relationships.page
      ? getPageSlug(pagesById, navbarItem.relationships.page.data.id)
      : CODE_TO_LINK_MAP[navbarItem.attributes.code];

    const displayName = getDisplayName(navbarItem, customNavbarEnabled, linkTo);

    const onlyActiveOnIndex = linkTo === '/';

    return { linkTo, displayName, onlyActiveOnIndex };
  });
}

// TODO change this when multilocs have correct values
function getDisplayName(
  navbarItem: INavbarItem,
  customNavbarEnabled: boolean,
  linkTo: string
) {
  if (customNavbarEnabled) {
    return <T value={navbarItem.attributes.title_multiloc} />;
  }

  return <FormattedMessage {...LINK_TO_MESSAGE_MAP[linkTo]} />;
}
