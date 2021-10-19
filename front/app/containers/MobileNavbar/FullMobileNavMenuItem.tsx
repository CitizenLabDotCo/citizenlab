import React from 'react';
import styled from 'styled-components';
import Link from 'utils/cl-router/Link';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';
import FeatureFlag from 'components/FeatureFlag';
import { TAppConfigurationSetting } from 'services/appConfiguration';

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
  displayName: React.ReactNode;
  onClick: () => void;
  onlyActiveOnIndex?: boolean;
  featureFlagName?: TAppConfigurationSetting;
}

const FullMobileNavMenuItem = ({
  linkTo,
  displayName,
  onClick,
  onlyActiveOnIndex,
  featureFlagName,
}: Props) => {
  return (
    <FeatureFlag name={featureFlagName}>
      <MenuItem>
        <StyledLink
          onClick={onClick}
          to={linkTo}
          activeClassName="active"
          onlyActiveOnIndex={onlyActiveOnIndex}
        >
          {displayName}
        </StyledLink>
      </MenuItem>
    </FeatureFlag>
  );
};

export default FullMobileNavMenuItem;
