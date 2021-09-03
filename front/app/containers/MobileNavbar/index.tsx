import React, { useEffect, useState, useRef, lazy, Suspense } from 'react';
import styled, { css } from 'styled-components';
import { media, fontSizes, colors, isRtl } from 'utils/styleUtils';
import messages from './messages';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import { lighten } from 'polished';
import MobileNavbarItem from './MobileNavbarItem';
import ShowFullMenuButton from './ShowFullMenuButton';
const FullMobileNavMenu = lazy(() => import('./FullMobileNavMenu'));
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

const Container = styled.nav`
  height: ${(props) => props.theme.mobileMenuHeight}px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: solid 1px ${lighten(0.3, colors.label)};
  display: flex;
  align-items: stretch;
  z-index: 1005;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${media.biggerThanMaxTablet`
    display: none;
  `}

  @media print {
    display: none;
  }
`;

const StyledFullMobileNavMenu = styled(FullMobileNavMenu)`
  position: fixed;
  z-index: 1004;
`;

export const NavigationLabel = styled.span`
  width: 100%;
  font-size: ${fontSizes.base}px;
  font-weight: 500;

  ${isRtl`
    margin-left: 0;
    margin-right: 6px;
  `}
`;

const NavigationItems = styled.ul`
  display: flex;
  justify-content: space-evenly;
  width: 100%;
  margin: 0;
  padding: 0;
`;

export const NavigationItem = styled.li`
  display: flex;
  align-items: stretch;
  cursor: pointer;
  margin: 0;
  padding: 0;

  & > * {
    padding: 0 20px;

    ${media.largePhone`
      padding: 0;
    `}
  }

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

export const NavigationItemContentStyles = css`
  display: flex;
  align-items: center;
`;

interface Props {
  setRef?: (arg: HTMLElement) => void | undefined;
  className?: string;
}

const MobileNavigation = ({
  location,
  className,
  setRef,
  intl: { formatMessage },
}: Props & WithRouterProps & InjectedIntlProps) => {
  const [isFullMenuOpened, setIsFullMenuOpened] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const urlSegments = !isNilOrError(location)
    ? location.pathname.replace(/^\/|\/$/g, '').split('/')
    : [''];
  const secondUrlSegment =
    urlSegments && urlSegments.length >= 1 ? urlSegments[1] : null;

  useEffect(() => {
    if (setRef && containerRef.current) {
      setRef(containerRef.current);
    }
  }, []);

  const handleOnShowMoreClick = (isFullMenuOpened: boolean) => () => {
    onShowMore();
    trackEventByName(
      isFullMenuOpened
        ? tracks.moreButtonClickedFullMenuOpened
        : tracks.moreButtonClickedFullMenuClosed
    );
  };

  const handleOnNavItemClick = (navItem: 'home' | 'projects') => () => {
    onCloseFullMenu();
    trackEventByName(
      {
        home: tracks.homeLinkClicked,
        projects: tracks.projectsLinkClicked,
      }[navItem]
    );
  };

  const onShowMore = () => {
    setIsFullMenuOpened((prevIsFullMenuOpened) => !prevIsFullMenuOpened);
  };

  const onCloseFullMenu = () => {
    setIsFullMenuOpened(false);
  };

  return (
    <>
      <Container
        className={className}
        ref={containerRef}
        // screen reader will add "navigation", so this will become
        // "Compact mobile navigation"
        // Needed because there's a second nav (FullMobileNav)
        aria-label={formatMessage(messages.shortenedMobile)}
      >
        <NavigationItems>
          <MobileNavbarItem
            linkTo="/"
            iconName="homeFilled"
            navigationItemMessage={messages.mobilePageHome}
            onlyActiveOnIndex
            isFullMenuOpened={isFullMenuOpened}
            onClick={handleOnNavItemClick('home')}
          />
          <MobileNavbarItem
            className={secondUrlSegment === 'projects' ? 'active' : ''}
            linkTo="/projects"
            iconName="folder"
            navigationItemMessage={messages.mobilePageProjects}
            isFullMenuOpened={isFullMenuOpened}
            onClick={handleOnNavItemClick('projects')}
          />
          <ShowFullMenuButton
            isFullMenuOpened={isFullMenuOpened}
            onClick={handleOnShowMoreClick(isFullMenuOpened)}
          />
        </NavigationItems>
      </Container>
      <Suspense fallback={null}>
        <StyledFullMobileNavMenu
          isFullMenuOpened={isFullMenuOpened}
          onClose={onCloseFullMenu}
        />
      </Suspense>
    </>
  );
};

export default withRouter(injectIntl(MobileNavigation));
