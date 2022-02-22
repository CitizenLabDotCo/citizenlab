import React from 'react';
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// hooks
import useNavbarItems from 'hooks/useNavbarItems';
import usePageSlugById from 'hooks/usePageSlugById';

// components
import FullscreenModal from 'components/UI/FullscreenModal';
import FullMobileNavMenuItem from './FullMobileNavMenuItem';
import TenantLogo from './TenantLogo';

// styles
import styled, { css } from 'styled-components';
import { media, colors, hexToRgb } from 'utils/styleUtils';
import { darken } from 'polished';
// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import getNavbarItemPropsArray from '../MainHeader/DesktopNavbar/getNavbarItemPropsArray';
import CloseIconButton from 'components/UI/CloseIconButton';

const containerBackgroundColorRgb = hexToRgb(colors.label);

const Container = styled.div`
  ${containerBackgroundColorRgb
    ? css`
        background: rgba(
          ${containerBackgroundColorRgb.r},
          ${containerBackgroundColorRgb.g},
          ${containerBackgroundColorRgb.b},
          0.95
        );
      `
    : css`
        background: rgba(0, 0, 0, 0.75);
      `}
  height: 100%;
  width: 100%;
  padding-top: 40px;
  position: relative;

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const ContentContainer = styled.nav`
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  background: #fff;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: scroll;
  overflow-x: hidden;
  position: absolute;
  bottom: 0;
  width: 100%;

  ${({ theme: { mobileMenuHeight } }) => {
    return `
        height: calc(100% - ${mobileMenuHeight}px);
      `;
  }}
`;

const StyledCloseIconButton = styled(CloseIconButton)`
  position: absolute;
  top: 30px;
  right: 25px;
  z-index: 2000;
  border-radius: 50%;
  border: solid 1px transparent;
  padding: 15px;

  &:hover {
    background: #e0e0e0;
  }

  ${media.smallerThanMinTablet`
    right: 15px;
  `}
`;

const MenuItems = styled.ul`
  margin: 0;
  padding: 0;
  text-align: center;
`;

const StyledTenantLogo = styled(TenantLogo)`
  margin-bottom: 40px;
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
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const navbarItems = useNavbarItems();
  const pageSlugById = usePageSlugById();

  if (isNilOrError(navbarItems) || isNilOrError(pageSlugById)) return null;

  const navbarItemPropsArray = getNavbarItemPropsArray(
    navbarItems,
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
            // Needed because there's also a different nav (see MobileNavbar/index)
            aria-label={formatMessage(messages.fullMobileNavigation)}
          >
            <StyledTenantLogo />
            <MenuItems>
              {navbarItemPropsArray.map((navbarItemProps) => {
                const { linkTo, onlyActiveOnIndex, navigationItemTitle } =
                  navbarItemProps;

                return (
                  <FullMobileNavMenuItem
                    key={linkTo}
                    linkTo={linkTo}
                    onlyActiveOnIndex={onlyActiveOnIndex}
                    navigationItemTitle={navigationItemTitle}
                    onClick={handleOnMenuItemClick(linkTo)}
                  />
                );
              })}
            </MenuItems>
            <StyledCloseIconButton
              a11y_buttonActionMessage={messages.closeMobileNavMenu}
              onClick={handleOnCloseButtonClick}
              iconColor={colors.label}
              iconColorOnHover={darken(0.1, colors.label)}
              iconWidth={'12px'}
              iconHeight={'12px'}
            />
          </ContentContainer>
        </Container>
      </StyledFullscreenModal>
    );
  }

  return null;
};

export default injectIntl(FullMobileNavMenu);
