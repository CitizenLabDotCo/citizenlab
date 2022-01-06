import React from 'react';
import { Multiloc } from 'typings';

// styling
import styled from 'styled-components';
import { darken } from 'polished';
import { media, colors } from 'utils/styleUtils';

// components
import { NavigationItem, NavigationLabel } from './';
import Link from 'utils/cl-router/Link';
import { Icon, IconNames } from '@citizenlab/cl2-component-library';
import T from 'components/T';

// there's a name clash when importing styled components
// from a file that also imports styled
const xStyled = styled;

const NavigationIconWrapper = xStyled.div`
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

const NavigationIcon = xStyled(Icon)`
  fill: ${colors.label};
  height: 22px;
  width: 22px;

  .cl-icon-primary,
  .cl-icon-accent,
  .cl-icon-secondary {
    fill: ${colors.label};
  }
`;

const linkColor = colors.label;
const StyledLink = xStyled(Link)`
  display: flex;
  align-items: center;
  color: ${linkColor};

  // the darken styles are the same as the ones in the Button component,
  // which is used for the last item of the navbar to show the full menu
  &:hover {
    color: ${darken(0.2, linkColor)};

    ${NavigationIcon} {
      fill: ${darken(0.2, linkColor)};

      .cl-icon-primary,
      .cl-icon-accent,
      .cl-icon-secondary {
        fill: ${darken(0.2, linkColor)};
      }
    }
  }

  // Need the active state (first one of selectors)
  // for touch devices
  &:active,
  &.active {
    color: ${(props) => props.theme.colorMain};

    ${NavigationIcon} {
      fill: ${(props) => props.theme.colorMain};

      .cl-icon-primary,
      .cl-icon-accent,
      .cl-icon-secondary {
        fill: ${(props) => props.theme.colorMain};
      }
    }

    &:hover {
      color: ${(props) => darken(0.2, props.theme.colorMain)};

      ${NavigationIcon} {
        fill: ${(props) => darken(0.2, props.theme.colorMain)};

        .cl-icon-primary,
        .cl-icon-accent,
        .cl-icon-secondary {
          fill: ${(props) => darken(0.2, props.theme.colorMain)};
        }
      }
    }
  }
`;

interface Props {
  className?: string;
  linkTo: string;
  navigationItemTitle: Multiloc;
  onlyActiveOnIndex?: boolean;
  iconName: IconNames;
  isFullMenuOpened: boolean;
  onClick: () => void;
}

const MobileNavbarItem = ({
  linkTo,
  navigationItemTitle,
  onlyActiveOnIndex,
  iconName,
  isFullMenuOpened,
  onClick,
}: Props) => {
  return (
    <NavigationItem>
      <StyledLink
        to={linkTo}
        activeClassName={!isFullMenuOpened ? 'active' : ''}
        onlyActiveOnIndex={onlyActiveOnIndex}
        onClick={onClick}
      >
        <NavigationIconWrapper>
          <NavigationIcon name={iconName} />
        </NavigationIconWrapper>
        <NavigationLabel>
          <T value={navigationItemTitle} />
        </NavigationLabel>
      </StyledLink>
    </NavigationItem>
  );
};

export default MobileNavbarItem;
