import React from 'react';
import styled from 'styled-components';
import Link from 'utils/cl-router/Link';
import { NavItem } from '.';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { Icon } from 'cl2-component-library';
import CountBadge from 'components/UI/CountBadge';
import HasPermission from 'components/HasPermission';

const Text = styled.div`
  flex: 1;
  color: #fff;
  opacity: 0.7;
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 19px;
  margin-left: 10px;
  display: flex;
  align-items: center;
  transition: all 80ms ease-out;

  ${media.smallerThan1200px`
    display: none;
  `}
`;

const ArrowIcon = styled(Icon)`
  fill: #fff;
  opacity: 0;
  transition: all 80ms ease-out;

  ${media.smallerThan1200px`
    display: none;
  `}
`;

const MenuItemLink = styled(Link)`
  flex: 0 0 auto;
  width: 210px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 5px;
  padding-right: 15px;
  cursor: pointer;
  border-radius: ${(props: any) => props.theme.borderRadius};
  transition: background-color 80ms ease-out;

  &:hover,
  &.selected,
  &.focus-visible {
    background: rgba(0, 0, 0, 0.36);

    ${Text} {
      opacity: 1;
    }
  }

  &:not(.selected) {
    .cl-icon {
      .cl-icon-primary {
        fill: ${colors.clIconPrimary};
      }
      .cl-icon-accent {
        fill: ${colors.clIconAccent};
      }
    }
  }

  &.selected {
    ${ArrowIcon} {
      opacity: 1;
    }

    .cl-icon {
      .cl-icon-primary {
        fill: ${colors.clIconAccent};
      }
      .cl-icon-accent {
        fill: ${colors.clIconPrimary};
      }
    }

    &.moderation {
      .cl-icon {
        .cl-icon-primary {
          fill: ${colors.clIconAccent};
        }
        .cl-icon-accent {
          fill: ${colors.clIconAccent};
        }
      }
    }
  }

  ${media.smallerThan1200px`
    width: 56px;
    padding-right: 5px;
  `}
`;

const IconWrapper = styled.div`
  flex: 0 0 auto;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;

  &.processing svg {
    height: 31px;
  }
`;

type Props = {
  route: NavItem;
};

export default ({ route }: Props) => {
  const pathname = location.pathname;
  return (
    <HasPermission action="access" item={{ type: 'route', path: route.link }}>
      <MenuItemLink
        activeClassName="active"
        className={`${route.iconName} ${
          route.isActive(pathname) ? 'selected' : ''
        }`}
        to={route.link}
      >
        <IconWrapper className={route.iconName}>
          <Icon name={route.iconName} />
        </IconWrapper>
        <Text>
          <FormattedMessage {...messages[route.message]} />
          {!!route.count && <CountBadge count={route.count} />}
        </Text>
        <ArrowIcon name="arrowLeft" />
      </MenuItemLink>
    </HasPermission>
  );
};
