// libraries
import React from 'react';

// components
import Link from 'utils/cl-router/Link';
import FeatureFlag from 'components/FeatureFlag';
import DesktopNavbarItem from './DesktopNavbarItem';
import AdminPublicationsNavbarItem from './AdminPublicationsNavbarItem';
import messages from '../messages';

// style
import styled from 'styled-components';
import { rgba } from 'polished';
import { media, fontSizes, isRtl } from 'utils/styleUtils';

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

export const NavigationItemBorder = styled.div`
  height: 6px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: 'transparent';
`;

export const NavigationItem = styled(Link)`
  color: ${({ theme }) => theme.navbarTextColor || theme.colorText};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 500;
  padding: 0 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 100ms ease-out;
  height: 100%;
  position: relative;

  &:hover {
    color: ${({ theme }) => theme.navbarTextColor || theme.colorText};
    text-decoration: underline;

    ${NavigationItemBorder} {
      background: ${({ theme }) =>
        theme.navbarActiveItemBorderColor
          ? rgba(theme.navbarActiveItemBorderColor, 0.3)
          : rgba(theme.colorMain, 0.3)};
    }
  }

  &.active {
    &:before {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      z-index: -1;
      background-color: ${({ theme }) =>
        theme.navbarActiveItemBackgroundColor || rgba(theme.colorMain, 0.05)};
      pointer-events: none;
    }

    ${NavigationItemBorder} {
      background: ${({ theme }) =>
        theme.navbarActiveItemBorderColor || theme.colorMain};
    }
  }
`;

export const NavigationItemText = styled.span`
  white-space: nowrap;
`;

const DesktopNavbar = () => {
  return (
    <Container>
      <DesktopNavbarItem
        linkTo={'/'}
        navigationItemText={messages.pageOverview}
        onlyActiveOnIndex
      />

      <AdminPublicationsNavbarItem />

      <FeatureFlag name="ideas_overview">
        <DesktopNavbarItem
          linkTo={'/ideas'}
          navigationItemText={messages.pageInputs}
        />
      </FeatureFlag>

      <FeatureFlag name="initiatives">
        <DesktopNavbarItem
          linkTo={'/initiatives'}
          navigationItemText={messages.pageInitiatives}
        />
      </FeatureFlag>

      <FeatureFlag name="events_page">
        <DesktopNavbarItem
          linkTo={'/events'}
          navigationItemText={messages.pageEvents}
        />
      </FeatureFlag>

      <DesktopNavbarItem
        linkTo={'/pages/information'}
        navigationItemText={messages.pageInformation}
      />
      <DesktopNavbarItem
        linkTo={'/pages/faq'}
        navigationItemText={messages.pageFaq}
      />
    </Container>
  );
};

export default DesktopNavbar;
