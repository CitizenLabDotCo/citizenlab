import React from 'react';

// hooks
import useNavbarItems from 'hooks/useNavbarItems';
import usePages from 'hooks/usePages';
import useModuleEnabled from 'hooks/useModuleEnabled';

// services
import { INavbarItem } from 'services/navbar';
import { IPageData } from 'services/pages';

// components
import DesktopNavbarItem from './DesktopNavbarItem';
import AdminPublicationsNavbarItem from './AdminPublicationsNavbarItem';
import messages from '../messages';

// style
import styled from 'styled-components';
import { media, isRtl } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';

// utils
import { isNilOrError } from 'utils/helperUtils';

const Container = styled.nav`
  height: 100%;
  margin-left: 35px;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
  ${isRtl`
    margin-right: 35px;
    margin-left: 0;
  `}
`;

const NavbarItems = styled.ul`
  display: flex;
  align-items: stretch;
  margin: 0;
  padding: 0;
  height: 100%;
  ${isRtl`
    flex-direction: row-reverse;
  `};
`;

const DesktopNavbar = () => {
  const navbarItems = useNavbarItems({ visible: true });
  const pages = usePages();
  const customNavbarEnabled = useModuleEnabled('commercial/navbar');

  console.log(navbarItems);

  if (isNilOrError(navbarItems) || isNilOrError(pages)) return null;

  const navbarItemPropsArray = getNavbarItemPropsArray(
    navbarItems,
    pages,
    customNavbarEnabled
  );

  return (
    <Container>
      <NavbarItems>
        <DesktopNavbarItem
          linkTo={'/'}
          navigationItemMessage={messages.pageOverview}
          onlyActiveOnIndex
        />
        <AdminPublicationsNavbarItem />
        <DesktopNavbarItem
          linkTo={'/ideas'}
          navigationItemMessage={messages.pageInputs}
          featureFlagName="ideas_overview"
        />
        <DesktopNavbarItem
          linkTo={'/initiatives'}
          navigationItemMessage={messages.pageInitiatives}
          featureFlagName="initiatives"
        />
        <DesktopNavbarItem
          linkTo={'/events'}
          navigationItemMessage={messages.pageEvents}
          featureFlagName="events_page"
        />
        <DesktopNavbarItem
          linkTo={'/pages/information'}
          navigationItemMessage={messages.pageInformation}
        />
        <DesktopNavbarItem
          linkTo={'/pages/faq'}
          navigationItemMessage={messages.pageFaq}
        />
      </NavbarItems>
    </Container>
  );
};

export default DesktopNavbar;

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

function getNavbarItemPropsArray(
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

    return { linkTo, displayName };
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
