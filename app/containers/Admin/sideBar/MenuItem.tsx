import React, { Component } from 'react';
import styled from 'styled-components';
import Link from 'utils/cl-router/Link';
import { NavItem } from '.';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import Icon from 'components/UI/Icon';

const Text = styled.div`
  flex: 1;
  color: ${colors.adminLightText};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 19px;
  margin-left: 10px;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const MenuItemLink: any = styled(Link) `
  flex: 0 0 auto;
  width: 210px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 5px;
  padding-right: 15px;
  padding-bottom: 1px;
  margin-bottom: 8px;
  cursor: pointer;
  border-radius: 5px;

  &:hover {
    ${Text} {
      color: #fff;
    };

    .cl-icon {
      .cl-icon-primary {
        fill: ${colors.clIconAccent}
      }
      .cl-icon-accent {
        fill: ${colors.clIconPrimary}
      }
    };
  }

  &.selected {
    background: rgba(0, 0, 0, 0.25);

    ${Text} {
      color: #fff;
    };

    .cl-icon {
      .cl-icon-primary {
        fill: ${colors.clIconAccent}
      }
      .cl-icon-accent {
        fill: ${colors.clIconPrimary}
      }
    };
  }
`;

const IconWrapper = styled.div`
  flex: 0 0 auto;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

type Props = {
  route: NavItem;
  pathname: string;
};

class MenuItem extends Component<Props & InjectedIntlProps> {

  render() {
    const { route, pathname, intl: { formatMessage } } = this.props;
    return (
      <MenuItemLink activeClassName="active" className={`${route.isActive(pathname) ? 'selected' : ''}`} to={route.link}>
        <IconWrapper><Icon name={route.iconName} /></IconWrapper>
        <Text>{formatMessage({ ...messages[route.message] })}</Text>
        {route.isActive(pathname) && <Icon name="arrowLeft" />}
      </MenuItemLink>
    );
  }
}

export default injectIntl(MenuItem);
