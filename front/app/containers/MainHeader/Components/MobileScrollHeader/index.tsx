// libraries
import React, { useEffect, useRef, useState } from 'react';
import { includes } from 'lodash-es';
import { locales } from 'containers/App/constants';

// components
import useLocale from 'hooks/useLocale';

// utils
import { isPage } from 'utils/helperUtils';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import TenantLogo from '../TenantLogo';
import MobileNavbarContent from '../NavbarContent/MobileNavbarContent';
import { useBreakpoint } from '@citizenlab/cl2-component-library';
import { ContainerInner, Left } from 'containers/MainHeader';

const Container = styled.header<{
  position: 'fixed' | 'absolute';
}>`
  background: ${({ theme }) => theme.navbarBackgroundColor || '#fff'};
  box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.1);
  z-index: 1004;
  position: fixed;
  top: -100px; /* Hide the navbar 50 px outside of the top view */
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
  const containerRef = useRef<HTMLDivElement>(null);
  const isPhoneOrSmaller = useBreakpoint('phone');
  const locale = useLocale();
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

  if (!isPhoneOrSmaller) {
    return null;
  }

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

  return (
    <Container
      id="e2e-navbar"
      className={`${
        isAdminPage ? 'admin' : 'citizenPage'
      } ${'alwaysShowBorder'} ${
        isIdeaPage || isInitiativePage ? 'hideNavbar' : ''
      }
      ${showNavBar.current ? 'scroll-up-nav' : ''}
      `}
      ref={containerRef}
      position={isProjectPage ? 'absolute' : 'fixed'}
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
