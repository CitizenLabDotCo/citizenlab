// libraries
import React from 'react';

// components
import FeatureFlag from 'components/FeatureFlag';
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
  // const items = [
  //   {
  //     key: 'home',
  //     linkTo: '/',
  //     linkMessage: messages.pageOverview,
  //   },
  //   {
  //     key: 'projects',
  //     linkTo: '/projects',
  //     linkMessage: messages.mobilePageProjects,
  //   },
  //   {
  //     key: 'all-input',
  //     linkTo: '/ideas',
  //     linkMessage: messages.pageInputs,
  //   },
  //   {
  //     key: 'proposals',
  //     linkTo: '/initiatives',
  //     linkMessage: messages.pageInitiatives,
  //   },
  //   {
  //     key: 'events',
  //     linkTo: '/events',
  //     linkMessage: messages.pageEvents,
  //   },
  //   {
  //     key: 'about',
  //     linkTo: '/pages/information',
  //     linkMessage: messages.pageInformation,
  //   },
  //   {
  //     key: 'faq',
  //     linkTo: '/pages/faq',
  //     linkMessage: messages.pageFaq,
  //   },
  // ];
  return (
    <Container>
      <NavbarItems>
        <DesktopNavbarItem
          linkTo={'/'}
          navigationItemMessage={messages.pageOverview}
          onlyActiveOnIndex
        />

        <AdminPublicationsNavbarItem />

        <FeatureFlag name="ideas_overview">
          <DesktopNavbarItem
            linkTo={'/ideas'}
            navigationItemMessage={messages.pageInputs}
          />
        </FeatureFlag>

        <FeatureFlag name="initiatives">
          <DesktopNavbarItem
            linkTo={'/initiatives'}
            navigationItemMessage={messages.pageInitiatives}
          />
        </FeatureFlag>

        <FeatureFlag name="events_page">
          <DesktopNavbarItem
            linkTo={'/events'}
            navigationItemMessage={messages.pageEvents}
          />
        </FeatureFlag>

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
