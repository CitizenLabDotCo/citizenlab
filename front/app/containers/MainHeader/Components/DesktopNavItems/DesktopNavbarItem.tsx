import React from 'react';

import { fontSizes } from '@citizenlab/cl2-component-library';
import { rgba } from 'polished';
import { RouteType } from 'routes';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import T from 'components/T';

import Link from 'utils/cl-router/Link';

const NavigationItemBorder = styled.div`
  height: 6px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: transparent;
`;

const NavigationItem = styled.li``;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.navbarTextColor || theme.colors.tenantText};
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
  white-space: nowrap;
  &:hover {
    color: ${({ theme }) => theme.navbarTextColor || theme.colors.tenantText};
    text-decoration: underline;
    ${NavigationItemBorder} {
      background: ${({ theme }) =>
        theme.navbarActiveItemBorderColor
          ? rgba(theme.navbarActiveItemBorderColor, 0.3)
          : rgba(theme.colors.tenantPrimary, 0.3)};
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
        theme.navbarActiveItemBackgroundColor ||
        rgba(theme.colors.tenantPrimary, 0.05)};
      pointer-events: none;
    }
    ${NavigationItemBorder} {
      background: ${({ theme }) =>
        theme.navbarActiveItemBorderColor || theme.colors.tenantPrimary};
    }
  }
`;

interface Props {
  className?: string;
  linkTo: RouteType;
  navigationItemTitle: Multiloc;
  onlyActiveOnIndex?: boolean;
}

const DesktopNavbarItem = ({
  linkTo,
  navigationItemTitle,
  onlyActiveOnIndex,
}: Props) => (
  <NavigationItem data-testid="desktop-navbar-item">
    <StyledLink to={linkTo} onlyActiveOnIndex={onlyActiveOnIndex} scrollToTop>
      <NavigationItemBorder />
      <T value={navigationItemTitle} />
    </StyledLink>
  </NavigationItem>
);

export default DesktopNavbarItem;
