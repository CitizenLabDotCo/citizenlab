import React from 'react';
import styled from 'styled-components';
import Link from 'utils/cl-router/Link';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';
import FeatureFlag from 'components/FeatureFlag';
import { TAppConfigurationSetting } from 'services/appConfiguration';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

const MenuItem = styled.li`
  font-size: ${fontSizes.base}px;
  display: flex;
  justify-content: center;
`;

const StyledLink = styled(Link)`
  color: ${colors.text};
  padding: 20px 10px;
  border-radius: 5px;

  &:hover {
    color: ${darken(0.2, colors.text)};
  }

  &:active {
    background: ${darken(0.05, '#fff')};
  }

  &.active {
    color: ${(props) => props.theme.colorMain};
  }
`;

interface Props {
  linkTo: string;
  linkMessage: ReactIntl.FormattedMessage.MessageDescriptor;
  onClick: () => void;
  onlyActiveOnIndex?: boolean;
  featureFlagName?: TAppConfigurationSetting;
}

const FullMobileNavMenuItem = ({
  linkTo,
  linkMessage,
  onClick,
  onlyActiveOnIndex,
  intl: { formatMessage },
  featureFlagName,
}: Props & InjectedIntlProps) => {
  const menuItem = (
    <MenuItem>
      <StyledLink
        onClick={onClick}
        to={linkTo}
        activeClassName="active"
        onlyActiveOnIndex={onlyActiveOnIndex}
      >
        {formatMessage(linkMessage)}
      </StyledLink>
    </MenuItem>
  );
  if (featureFlagName) {
    return <FeatureFlag name={featureFlagName}>{menuItem}</FeatureFlag>;
  } else {
    return menuItem;
  }
};

export default injectIntl(FullMobileNavMenuItem);
