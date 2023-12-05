// libraries
import React, { useEffect, useRef, useState } from 'react';
import { includes } from 'lodash-es';
import { locales } from 'containers/App/constants';

// components

import Fragment from 'components/Fragment';
import useLocale from 'hooks/useLocale';

// utils
import { isPage } from 'utils/helperUtils';

// style
import styled from 'styled-components';
import { media, isRtl } from 'utils/styleUtils';
import TenantLogo from '../TenantLogo';
import MobileNavbarContent from '../NavbarContent/MobileNavbarContent';

const Container = styled.header<{
  position: 'fixed' | 'absolute';
}>`
  background: ${({ theme }) => theme.navbarBackgroundColor || '#fff'};
  box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.1);
  z-index: 1004;
  position: fixed; /* Make it stick/fixed */
  top: 0px; /* Hide the navbar 50 px outside of the top view */
  width: 100%; /* Full width */
  display: none;

  &.scroll-up-nav {
    display: block;
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

const OnScrollHeader = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const showNavBar = useRef(false);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    function onScroll() {
      const currentPosition = document.documentElement.scrollTop;

      if (currentPosition > scrollTop) {
        // downscroll code
        showNavBar.current = false;
      } else {
        // upscroll code
        showNavBar.current = true;
      }
      setScrollTop(currentPosition <= 0 ? 0 : currentPosition);
    }

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollTop]);

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
        <StyledRightFragment name="navbar-right">
          <MobileNavbarContent />
        </StyledRightFragment>
      </ContainerInner>
    </Container>
  );
};

export default OnScrollHeader;
