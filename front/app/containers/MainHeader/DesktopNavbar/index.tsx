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
  display: flex;
  align-items: stretch;
  margin-left: 35px;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
  ${isRtl`
    margin-right: 35px;
    margin-left: 0;
    flex-direction: row-reverse;
  `}
`;

const DesktopNavbar = () => {
  return (
    <Container>
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
    </Container>
  );
};

export default DesktopNavbar;
