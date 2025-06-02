import React, { useRef, useEffect, useState } from 'react';

import { media, isRtl, useBreakpoint } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import DesktopNavItems from './Components/DesktopNavItems';
import DesktopNavbarContent from './Components/NavbarContent/DesktopNavbarContent';
import MobileNavbarContent from './Components/NavbarContent/MobileNavbarContent';
import TenantLogo from './Components/TenantLogo';

const Container = styled.header`
  width: 100vw;
  height: ${({ theme }) => theme.menuHeight}px;
  display: flex;
  align-items: stretch;
  position: fixed;
  top: 0;
  left: 0;
  background: ${({ theme }) => theme.navbarBackgroundColor || '#fff'};
  box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.1);
  z-index: 1004;

  ${media.tablet`
    position: absolute;

    &.scroll-up-nav {
      position: fixed;
      top: 0px;
    }
  `}
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

const RightContainer = styled.div`
  max-width: 200px;
`;

const MainHeader = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [showMobileStickyNav, setShowMobileStickyNav] =
    useState<boolean>(false);

  const isSmallerThanTablet = useBreakpoint('tablet');
  const isDesktopUser = !isSmallerThanTablet;

  // Used to show the mobile navbar on scrolling up, or hide it on scrolling down
  useEffect(() => {
    let lastScrollTop = 0;

    function onScroll() {
      // Positive value means we've scrolled down
      const currentPosition = document.documentElement.scrollTop;

      // not scrolled yet/still at the top or downscroll
      if (currentPosition <= 0 || currentPosition > lastScrollTop) {
        setShowMobileStickyNav(false);
        // upscroll
      } else {
        setShowMobileStickyNav(true);
      }

      lastScrollTop = currentPosition <= 0 ? 0 : currentPosition;
    }

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Container
      id="e2e-navbar"
      className={showMobileStickyNav ? 'scroll-up-nav' : ''}
      ref={containerRef}
    >
      <ContainerInner>
        <Left>
          <TenantLogo />
          {isDesktopUser && <DesktopNavItems />}
        </Left>

        <RightContainer>
          {isDesktopUser ? <DesktopNavbarContent /> : <MobileNavbarContent />}
        </RightContainer>
      </ContainerInner>
    </Container>
  );
};

export default MainHeader;
