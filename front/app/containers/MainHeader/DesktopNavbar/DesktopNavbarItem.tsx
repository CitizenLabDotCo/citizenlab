import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { fontSizes } from 'utils/styleUtils';
import { rgba } from 'polished';
import FeatureFlag from 'components/FeatureFlag';
import { TAppConfigurationSetting } from 'services/appConfiguration';

const NavigationItemBorder = styled.div`
  height: 6px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: transparent;
`;

const NavigationItem = styled.li``;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.navbarTextColor || theme.colorText};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 500;
  padding: 0 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 100ms ease-out;
  height: 100%;
  position: relative;
  white-space: nowrap;

  &:hover {
    color: ${({ theme }) => theme.navbarTextColor || theme.colorText};
    text-decoration: underline;

    ${NavigationItemBorder} {
      background: ${({ theme }) =>
        theme.navbarActiveItemBorderColor
          ? rgba(theme.navbarActiveItemBorderColor, 0.3)
          : rgba(theme.colorMain, 0.3)};
    }
  }

  &.active {
    &:before {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      z-index: -1;
      background-color: ${({ theme }) =>
        theme.navbarActiveItemBackgroundColor || rgba(theme.colorMain, 0.05)};
      pointer-events: none;
    }

    ${NavigationItemBorder} {
      background: ${({ theme }) =>
        theme.navbarActiveItemBorderColor || theme.colorMain};
    }
  }
`;

interface Props {
  className?: string;
  linkTo: string;
  navigationItemMessage: ReactIntl.FormattedMessage.MessageDescriptor;
  onlyActiveOnIndex?: boolean;
  featureFlagName?: TAppConfigurationSetting;
}

const DesktopNavbarItem = ({
  className,
  linkTo,
  navigationItemMessage,
  onlyActiveOnIndex,
  featureFlagName,
}: Props) => {
  const navItem = (
    <NavigationItem>
      <StyledLink
        className={className}
        to={linkTo}
        activeClassName="active"
        onlyActiveOnIndex={onlyActiveOnIndex}
      >
        <NavigationItemBorder />
        <FormattedMessage {...navigationItemMessage} />
      </StyledLink>
    </NavigationItem>
  );
  if (featureFlagName) {
    return <FeatureFlag name={featureFlagName}>{navItem}</FeatureFlag>;
  } else {
    return navItem;
  }
};

export default DesktopNavbarItem;
