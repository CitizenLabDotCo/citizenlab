// libraries
import React, { useEffect, useRef, useState } from 'react';

// components
import { ContainerInner, Left } from 'containers/MainHeader';
import MobileNavbarContent from '../NavbarContent/MobileNavbarContent';
import TenantLogo from '../TenantLogo';

// utils
import {
  isAdminPage,
  isIdeaPage,
  isInitiativePage,
} from 'containers/MainHeader/utils';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import { useBreakpoint } from '@citizenlab/cl2-component-library';

const Container = styled.header`
  background: ${({ theme }) => theme.navbarBackgroundColor || '#fff'};
  box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.1);
  z-index: 1004;
  position: fixed;
  top: -100px; /* Hide navbar outside the top view */
  width: 100%;
  display: block;

  &.scroll-up-nav {
    transition: top 0.3s;
    top: -0px;
  }

  &.hideNavbar {
    ${media.tablet`
      display: none;
    `}
  }

  @media print {
    display: none;
  }
`;

const MobileScrollHeader = () => {
  const isPhoneOrSmaller = useBreakpoint('phone');
  const showNavBar = useRef(false);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    function onScroll() {
      const currentPosition = document.documentElement.scrollTop;

      if (currentPosition > scrollTop) {
        // downscroll
        showNavBar.current = false;
      } else {
        // upscroll
        showNavBar.current = true;
      }
      setScrollTop(currentPosition <= 0 ? 0 : currentPosition);
    }

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollTop]);

  // Only show the scroll header on mobile
  if (!isPhoneOrSmaller) {
    return null;
  }

  // Get url segments
  const urlSegments = location.pathname.replace(/^\/+/g, '').split('/');

  return (
    <Container
      id="e2e-navbar"
      className={`${
        isAdminPage() ? 'admin' : 'citizenPage'
      } ${'alwaysShowBorder'} ${
        isIdeaPage(urlSegments) || isInitiativePage(urlSegments)
          ? 'hideNavbar'
          : ''
      }
      ${showNavBar.current ? 'scroll-up-nav' : ''}
      `}
    >
      <ContainerInner>
        <Left>
          <TenantLogo />
        </Left>
        <MobileNavbarContent />
      </ContainerInner>
    </Container>
  );
};

export default MobileScrollHeader;
