import React from 'react';

import { Box, media, colors } from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import styled from 'styled-components';

import useCustomPageSlugById from 'api/custom_pages/useCustomPageSlugById';
import useNavbarItems from 'api/navbar/useNavbarItems';

import useLocalize from 'hooks/useLocalize';

import CloseIconButton from 'components/UI/CloseIconButton';
import FullscreenModal from 'components/UI/FullscreenModal';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../../../messages';
import tracks from '../../../tracks';
import getNavbarItemPropsArray from '../../DesktopNavItems/getNavbarItemPropsArray';
import TenantLogo from '../../TenantLogo';

import FullMobileNavMenuItem from './FullMobileNavMenuItem';

const Container = styled.div`
  height: 100%;
  width: 100%;
  padding-top: 40px;
  position: relative;

  ${media.desktop`
    display: none;
  `}
`;

const ContentContainer = styled.nav`
  background: #fff;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: scroll;
  overflow-x: hidden;
  position: absolute;
  bottom: 0;
  top: 0;
  min-height: 100vh;
  width: 100%;
`;

const StyledCloseIconButton = styled(CloseIconButton)`
  position: absolute;
  top: 12px;
  right: 25px;
  z-index: 2000;
  border-radius: 50%;
  border: solid 1px transparent;
  padding: 15px;

  &:hover {
    background: #e0e0e0;
  }

  ${media.phone`
    right: 15px;
  `}
`;

const MenuItems = styled.ul`
  margin: 0;
  padding: 0;
  text-align: center;
`;

const StyledFullscreenModal = styled(FullscreenModal)`
  // Hides the double navbar you see on desktop when on
  // a screen size that shows the mobile nav bar. The
  // mobile navbar menu scrollbar is still show.
  .fullscreenmodal-scrollcontainer {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

interface Props {
  onClose: () => void;
  isFullMenuOpened: boolean;
  mobileNavbarRef: HTMLElement;
}

const FullMobileNavMenu = ({
  mobileNavbarRef,
  onClose,
  isFullMenuOpened,
}: Props) => {
  const { data: navbarItems } = useNavbarItems();
  const pageSlugById = useCustomPageSlugById();
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  if (isNilOrError(navbarItems) || isNilOrError(pageSlugById)) return null;

  const navbarItemPropsArray = getNavbarItemPropsArray(
    navbarItems.data,
    pageSlugById
  );

  const modalPortalElement = document?.getElementById('mobile-nav-portal');

  const handleOnCloseButtonClick = () => {
    onClose();
    trackEventByName(tracks.closeButtonClickedFullMenu);
  };

  const handleOnMenuItemClick = (itemClicked: string) => () => {
    onClose();
    trackEventByName(tracks.navItemClickedFullMenu, {
      itemClicked,
    });
  };

  if (modalPortalElement) {
    return (
      <StyledFullscreenModal
        opened={isFullMenuOpened}
        close={onClose}
        mobileNavbarRef={mobileNavbarRef}
        modalPortalElement={modalPortalElement}
      >
        <Container>
          <ContentContainer
            // Screen reader will add "navigation", so this will become
            // "Full mobile navigation"
            // Needed because there's also a different nav (see MobileNavbarContent/index)
            aria-label={formatMessage(messages.fullMobileNavigation)}
          >
            <Box mb="16px">
              <TenantLogo />
            </Box>
            <MenuItems>
              {navbarItemPropsArray.map((navbarItemProps) => {
                const { linkTo, onlyActiveOnIndex, navigationItemTitle } =
                  navbarItemProps;
                return (
                  <FullMobileNavMenuItem
                    key={linkTo}
                    linkTo={linkTo}
                    onlyActiveOnIndex={onlyActiveOnIndex}
                    navigationItemTitle={localize(navigationItemTitle)}
                    onClick={handleOnMenuItemClick(linkTo)}
                    scrollToTop
                  />
                );
              })}
              <FullMobileNavMenuItem
                linkTo={'/projects?focusSearch=true'}
                navigationItemTitle={formatMessage(messages.search)}
                onClick={handleOnMenuItemClick('/projects?focusSearch=true')}
                iconName="search"
                scrollToTop
              />
            </MenuItems>
            <StyledCloseIconButton
              a11y_buttonActionMessage={messages.closeMobileNavMenu}
              onClick={handleOnCloseButtonClick}
              iconColor={colors.textSecondary}
              iconColorOnHover={darken(0.1, colors.textSecondary)}
            />
          </ContentContainer>
        </Container>
      </StyledFullscreenModal>
    );
  }

  return null;
};

export default FullMobileNavMenu;
