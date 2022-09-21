import React, { useEffect, useState, useRef, lazy, Suspense } from 'react';
import styled from 'styled-components';
import { media, fontSizes, colors, isRtl } from 'utils/styleUtils';
import messages from './messages';
import { lighten } from 'polished';
import MobileNavbarItem from './MobileNavbarItem';
import ShowFullMenuButton from './ShowFullMenuButton';
const FullMobileNavMenu = lazy(() => import('./FullMobileNavMenu'));
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import useNavbarItems from 'hooks/useNavbarItems';
import { isNilOrError } from 'utils/helperUtils';

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
  z-index: 1006;

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

interface Props {
  setRef?: (arg: HTMLElement) => void | undefined;
  className?: string;
}

const MobileNavigation = ({
  className,
  setRef,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const navbarItems = useNavbarItems();
  const [isFullMenuOpened, setIsFullMenuOpened] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (setRef && containerRef.current) {
      setRef(containerRef.current);
    }
  }, [setRef]);

  if (isNilOrError(navbarItems)) return null;

  const homeItem = navbarItems.find(
    (navbarItem) => navbarItem.attributes.code === 'home'
  );
  const projectsItem = navbarItems.find(
    (navbarItem) => navbarItem.attributes.code === 'projects'
  );

  if (!homeItem || !projectsItem) return null;

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
        aria-label={formatMessage(messages.compactMobileMenu)}
      >
        <NavigationItems>
          <MobileNavbarItem
            linkTo="/"
            iconName="homeFilled"
            navigationItemTitle={homeItem.attributes.title_multiloc}
            onlyActiveOnIndex
            isFullMenuOpened={isFullMenuOpened}
            onClick={handleOnNavItemClick('home')}
          />
          <MobileNavbarItem
            linkTo="/projects"
            iconName="folder"
            navigationItemTitle={projectsItem.attributes.title_multiloc}
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
        {containerRef.current && (
          <FullMobileNavMenu
            isFullMenuOpened={isFullMenuOpened}
            onClose={onCloseFullMenu}
            mobileNavbarRef={containerRef.current}
          />
        )}
      </Suspense>
    </>
  );
};

export default injectIntl(MobileNavigation);
