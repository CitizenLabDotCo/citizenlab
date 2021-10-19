import React from 'react';

// services
import { INavbarItem } from 'services/navbar';
import { IPageData } from 'services/pages';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';

const TYPE_TO_LINK_MAP = {
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

const LINK_TO_FEATURE_FLAG_MAP = {
  '/ideas': 'ideas_overview',
  '/initiatives': 'initiatives',
  '/events': 'events_page',
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
    const page = pagesById[navbarItem.relationships.page.data.id];
    const { type } = navbarItem.attributes;

    const linkTo =
      type === 'custom'
        ? `/pages/${page.attributes.slug}`
        : TYPE_TO_LINK_MAP[type];

    const displayName = getDisplayName(navbarItem, customNavbarEnabled, linkTo);

    const featureFlagName = customNavbarEnabled
      ? LINK_TO_FEATURE_FLAG_MAP[linkTo]
      : undefined;

    const onlyActiveOnIndex = linkTo === '/';

    return { linkTo, displayName, featureFlagName, onlyActiveOnIndex };
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
