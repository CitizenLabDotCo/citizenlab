// libraries
import React from 'react';

// components
import DesktopNavbarItem from './DesktopNavbarItem';
import AdminPublicationsNavbarItem from './AdminPublicationsNavbarItem';
import messages from '../messages';

// style
import styled from 'styled-components';
import { media, isRtl } from 'utils/styleUtils';

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
