// libraries
import React, { useRef, useEffect, useState } from 'react';

// components
import DesktopNavItems from './Components/DesktopNavItems';
import MobileNavbarContent from './Components/NavbarContent/MobileNavbarContent';
import DesktopNavbarContent from './Components/NavbarContent/DesktopNavbarContent';
import Fragment from 'components/Fragment';
import TenantLogo from './Components/TenantLogo';

// hooks
import useLocale from 'hooks/useLocale';

// utils
import {
  isAdminPage,
  isIdeaPage,
  isInitiativePage,
  isProjectPage,
} from './utils';

// style
import styled from 'styled-components';
import { media, isRtl } from 'utils/styleUtils';
import { useBreakpoint } from '@citizenlab/cl2-component-library';

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

  &.scroll-up-nav {
    ${media.tablet`
    transition: top 0.3s;
    position: fixed;
    top: 0px;  `}
  }
`;

export const ContainerInner = styled.div`
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

export const Left = styled.div`
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

  const [showNavBar, setShowNavBar] = useState<boolean>(false);
  const [scrollTop, setScrollTop] = useState(0);

  const isSmallerThanTablet = useBreakpoint('tablet');
  const isDesktopUser = !isSmallerThanTablet;

  // Used to show/hide the mobile navbar on scroll
  useEffect(() => {
    function onScroll() {
      const currentPosition = document.documentElement.scrollTop;
      if (currentPosition <= 0) {
        setShowNavBar(false); // Don't show if we're at the top already
      } else if (currentPosition > scrollTop) {
        // downscroll
        setShowNavBar(false);
      } else {
        // upscroll
        setShowNavBar(true);
      }
      setScrollTop(currentPosition <= 0 ? 0 : currentPosition);
    }

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollTop]);

  // url segments
  const urlSegments = location.pathname.replace(/^\/+/g, '').split('/');

  return (
    <Container
      id="e2e-navbar"
      className={`${!isAdminPage() ? 'citizenPage' : ''} ${
        isIdeaPage(urlSegments) || isInitiativePage(urlSegments)
          ? 'hideNavbar'
          : ''
      }
      ${showNavBar ? 'scroll-up-nav' : ''}
      `}
      ref={containerRef}
      position={isProjectPage(urlSegments, locale) ? 'absolute' : 'fixed'}
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
