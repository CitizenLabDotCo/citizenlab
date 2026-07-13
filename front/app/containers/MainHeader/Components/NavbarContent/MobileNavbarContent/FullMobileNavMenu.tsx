import React from 'react';

import { Box, media, colors } from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import styled from 'styled-components';

import useNavbarItems from 'api/navbar/useNavbarItems';
import { getNavbarChildLink } from 'api/navbar/util';

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

import FullMobileNavMenuDropdown from './FullMobileNavMenuDropdown';
import FullMobileNavMenuDropdownItem from './FullMobileNavMenuDropdownItem';
import FullMobileNavMenuItem from './FullMobileNavMenuItem';

const ContentContainer = styled.nav`
  background: #fff;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: scroll;
  overflow-x: hidden;
  position: relative;
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
  list-style: none;
  width: 100%;
  max-width: 320px;
  text-align: left;

  > * {
    margin-top: 20px;
  }
  > *:first-child {
    margin-top: 0;
  }
  > *:last-child {
    margin-top: 48px;
  }

  ${media.phone`
    max-width: 100%;
  `}
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
}

const FullMobileNavMenu = ({ onClose, isFullMenuOpened }: Props) => {
  const { data: navbarItems } = useNavbarItems();
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  if (isNilOrError(navbarItems)) return null;

  const navbarItemPropsArray = getNavbarItemPropsArray(navbarItems.data);

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

  return (
    <StyledFullscreenModal opened={isFullMenuOpened} close={onClose}>
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
            const {
              linkTo,
              onlyActiveOnIndex,
              navigationItemTitle,
              navbarItem,
            } = navbarItemProps;
            // Dropdown items have no link of their own; render them as an
            // expandable row that reveals their children in place.
            if (navbarItem) {
              const dropdownChildren = navbarItem.attributes.children ?? [];
              return (
                <FullMobileNavMenuDropdown
                  key={navbarItem.id}
                  title={localize(navbarItem.attributes.title_multiloc)}
                >
                  {dropdownChildren.map((child) => {
                    const link = getNavbarChildLink(child);
                    if (!link) return null;
                    return (
                      <FullMobileNavMenuDropdownItem
                        key={child.id}
                        to={
                          link.to as Parameters<
                            typeof FullMobileNavMenuDropdownItem
                          >[0]['to']
                        }
                        params={
                          link.params as Parameters<
                            typeof FullMobileNavMenuDropdownItem
                          >[0]['params']
                        }
                        navigationItemTitle={localize(child.title_multiloc)}
                        onClick={handleOnMenuItemClick(child.id)}
                        scrollToTop
                      />
                    );
                  })}
                </FullMobileNavMenuDropdown>
              );
            }
            if (linkTo) {
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
            }
            return null;
          })}
          <FullMobileNavMenuItem
            to="/projects"
            search={{ focusSearch: true }}
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
    </StyledFullscreenModal>
  );
};

export default FullMobileNavMenu;
