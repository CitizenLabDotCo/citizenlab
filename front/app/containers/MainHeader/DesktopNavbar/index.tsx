import React from 'react';

// hooks
import useNavbarItems from 'hooks/useNavbarItems';
import usePages from 'hooks/usePages';

// components
import DesktopNavbarItem from './DesktopNavbarItem';
import AdminPublicationsNavbarItem from './AdminPublicationsNavbarItem';
import messages from '../messages';

// style
import styled from 'styled-components';
import { media, isRtl } from 'utils/styleUtils';

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

  if (isNilOrError(navbarItems) || isNilOrError(pages)) return null;

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
