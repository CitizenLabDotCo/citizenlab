import React from 'react';
import { removeFocus } from 'utils/helperUtils';
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// components
import { Icon } from 'cl2-component-library';
import FullscreenModal from 'components/UI/FullscreenModal';
import FullMobileNavMenuItem from './FullMobileNavMenuItem';
import TenantLogo from './TenantLogo';

// styles
import styled, { css } from 'styled-components';
import { media, colors, defaultOutline, hexToRgb } from 'utils/styleUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// services
import { TAppConfigurationSetting } from 'services/appConfiguration';

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

const CloseButton = styled.button`
  width: 30px;
  height: 30px;
  position: absolute;
  top: 20px;
  right: 25px;
  cursor: pointer;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  border-radius: 50%;
  border: solid 1px transparent;
  background: #fff;
  transition: all 100ms ease-out;
  outline: none !important;

  &:hover {
    background: #e0e0e0;
  }

  &.focus-visible {
    ${defaultOutline};
  }

  ${media.smallerThanMinTablet`
    right: 15px;
  `}
`;

const CloseIcon = styled(Icon)`
  width: 12px;
  height: 12px;
  fill: ${(props: any) => props.theme.colorText};
`;

const MenuItems = styled.ul`
  margin: 0;
  padding: 0;
  text-align: center;
`;

const StyledTenantLogo = styled(TenantLogo)`
  margin-bottom: 40px;
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
  const items = [
    {
      key: 'home',
      linkTo: '/',
      linkMessage: messages.mobilePageHome,
      onlyActiveOnIndex: true,
    },
    {
      key: 'projects',
      linkTo: '/projects',
      linkMessage: messages.mobilePageProjects,
      onlyActiveOnIndex: false,
    },
    {
      key: 'all-input',
      linkTo: '/ideas',
      linkMessage: messages.mobilePageAllInput,
      onlyActiveOnIndex: false,
      featureFlag: 'ideas_overview',
    },
    {
      key: 'proposals',
      linkTo: '/initiatives',
      linkMessage: messages.mobilePageProposals,
      onlyActiveOnIndex: false,
      featureFlag: 'initiatives',
    },
    {
      key: 'events',
      linkTo: '/events',
      linkMessage: messages.mobilePageEvents,
      onlyActiveOnIndex: false,
      featureFlag: 'events_page',
    },
    {
      key: 'about',
      linkTo: '/pages/information',
      linkMessage: messages.mobilePageAbout,
      onlyActiveOnIndex: false,
    },
    {
      key: 'faq',
      linkTo: '/pages/faq',
      linkMessage: messages.mobilePageFaq,
      onlyActiveOnIndex: false,
    },
  ];
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
    <FullscreenModal
      opened={isFullMenuOpened}
      close={onClose}
      mobileNavbarRef={mobileNavbarRef}
    >
      <Container>
        <CloseButton
          onMouseDown={removeFocus}
          onClick={handleOnCloseButtonClick}
        >
          <CloseIcon
            title={formatMessage(messages.closeMobileNavMenu)}
            name="close"
          />
        </CloseButton>
        <ContentContainer
          // isFullMenuOpened={isFullMenuOpened}
          // Screen reader will add "navigation", so this will become
          // "Full mobile navigation"
          // Needed because there's also a different nav (see MobileNavbar/index)
          aria-label={formatMessage(messages.fullMobileNavigation)}
        >
          <StyledTenantLogo />
          <MenuItems>
            {items.map((item) => {
              // as long as this comes from a hand-coded object,
              // triple-check whether item.featureFlag is correctly typed
              // will come from the back-end later
              const featureFlagName = item.featureFlag as TAppConfigurationSetting;
              return (
                <FullMobileNavMenuItem
                  key={item.key}
                  linkTo={item.linkTo}
                  linkMessage={item.linkMessage}
                  onClick={handleOnMenuItemClick(item.key)}
                  onlyActiveOnIndex={item.onlyActiveOnIndex}
                  featureFlagName={featureFlagName}
                />
              );
            })}
          </MenuItems>
        </ContentContainer>
      </Container>
    </FullscreenModal>
  );
};

export default injectIntl(FullMobileNavMenu);
