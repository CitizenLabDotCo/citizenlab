import React from 'react';
import styled from 'styled-components';
import {
  NavigationItem,
  NavigationLabel,
  NavigationItemContentStyles,
} from './';
import { media, colors } from 'utils/styleUtils';
import Link from 'utils/cl-router/Link';
import { Icon, IconNames } from 'cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';

const NavigationIconWrapper = styled.div`
  display: flex;
  height: 22px;
  width: 22px;
  align-items: center;
  justify-content: center;
  margin-right: 5px;

  ${media.smallPhone`
height: 20px;
width: 20px;
`}
`;

const NavigationIcon = styled(Icon)`
  fill: ${colors.label};
  height: 22px;
  width: 22px;

  .cl-icon-primary,
  .cl-icon-accent,
  .cl-icon-secondary {
    fill: ${colors.label};
  }
`;

const StyledLink = styled(Link)`
  ${NavigationItemContentStyles}

  &.active {
    ${NavigationIcon} {
      fill: ${(props) => props.theme.colorMain};

      .cl-icon-primary,
      .cl-icon-accent,
      .cl-icon-secondary {
        fill: ${(props) => props.theme.colorMain};
      }
    }

    ${NavigationLabel} {
      color: ${(props) => props.theme.colorMain};
    }
  }
`;

interface Props {
  className?: string;
  linkTo: string;
  navigationItemMessage: ReactIntl.FormattedMessage.MessageDescriptor;
  onlyActiveOnIndex?: boolean;
  iconName: IconNames;
}

const MobileNavbarItem = ({
  linkTo,
  navigationItemMessage,
  onlyActiveOnIndex,
  iconName,
}: Props) => {
  return (
    <NavigationItem>
      <StyledLink
        to={linkTo}
        activeClassName="active"
        onlyActiveOnIndex={onlyActiveOnIndex}
      >
        <NavigationIconWrapper>
          <NavigationIcon ariaHidden name={iconName} />
        </NavigationIconWrapper>
        <NavigationLabel>
          <FormattedMessage {...navigationItemMessage} />
        </NavigationLabel>
      </StyledLink>
    </NavigationItem>
  );
};

export default MobileNavbarItem;
