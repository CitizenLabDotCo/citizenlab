// libraries
import React, { useRef } from 'react';
import { includes } from 'lodash-es';
import { locales } from 'containers/App/constants';

// components
import DesktopNavItems from './Components/DesktopNavItems';
import MobileNavbarContent from './Components/NavbarContent/MobileNavbarContent';
import DesktopNavbarContent from './Components/NavbarContent/DesktopNavbarContent';
import Fragment from 'components/Fragment';
import { useBreakpoint } from '@citizenlab/cl2-component-library';
import useLocale from 'hooks/useLocale';

// utils
import { isPage } from 'utils/helperUtils';

// style
import styled from 'styled-components';
import { media, isRtl } from 'utils/styleUtils';
import TenantLogo from './Components/TenantLogo';

const Container = styled.header<{ position: 'fixed' | 'absolute' }>`
  width: 100vw;
  height: ${({ theme }) => theme.menuHeight}px;
  display: flex;
  align-items: stretch;
  position: ${(props) => props.position};
  top: 0;
  left: 0;
  background: ${({ theme }) => theme.navbarBackgroundColor || '#fff'};
  box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.1);
  z-index: 1004;

  &.hideNavbar {
    ${media.tablet`
      display: none;
    `}
  }

  &.citizenPage {
    ${media.tablet`
      position: absolute;
    `}
  }

  @media print {
    display: none;
  }
`;

const ContainerInner = styled.div`
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 20px;
  position: relative;
  ${isRtl`
    padding-left: 0px;
    padding-right: 20px;
    flex-direction: row-reverse;
    `}

  ${media.phone`
    padding-left: 15px;
  `}
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  height: ${({ theme }) => theme.menuHeight}px;
  ${isRtl`
    flex-direction: row-reverse;
    `}
`;

const StyledRightFragment = styled(Fragment)`
  max-width: 200px;
`;

const MainHeader = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();

  // url segments
  const urlSegments = location.pathname.replace(/^\/+/g, '').split('/');
  const firstUrlSegment = urlSegments[0];
  const secondUrlSegment = urlSegments[1];
  const lastUrlSegment = urlSegments[urlSegments.length - 1];

  // Page checks
  const isIdeaPage =
    urlSegments.length === 3 &&
    includes(locales, firstUrlSegment) &&
    secondUrlSegment === 'ideas' &&
    lastUrlSegment !== 'new';
  const isInitiativePage =
    urlSegments.length === 3 &&
    includes(locales, firstUrlSegment) &&
    secondUrlSegment === 'initiatives' &&
    lastUrlSegment !== 'new';
  const isAdminPage = isPage('admin', location.pathname);
  const isProjectPage = !!(
    urlSegments.length === 3 &&
    urlSegments[0] === locale &&
    urlSegments[1] === 'projects'
  );

  const isSmallerThanTablet = useBreakpoint('tablet');
  const isDesktopUser = !isSmallerThanTablet;

  return (
    <Container
      id="e2e-navbar"
      className={`${
        isAdminPage ? 'admin' : 'citizenPage'
      } ${'alwaysShowBorder'} ${
        isIdeaPage || isInitiativePage ? 'hideNavbar' : ''
      }`}
      ref={containerRef}
      position={isProjectPage ? 'absolute' : 'fixed'}
    >
      <ContainerInner>
        <Left>
          <TenantLogo />
          {isDesktopUser && <DesktopNavItems />}
        </Left>

        <StyledRightFragment name="navbar-right">
          {isDesktopUser ? <DesktopNavbarContent /> : <MobileNavbarContent />}
        </StyledRightFragment>
      </ContainerInner>
    </Container>
  );
};

export default MainHeader;
