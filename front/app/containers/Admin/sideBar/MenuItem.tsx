import React from 'react';
import styled from 'styled-components';
import Link from 'utils/cl-router/Link';
import { NavItem } from './navItems';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { Icon, Box } from '@citizenlab/cl2-component-library';
import CountBadge from 'components/UI/CountBadge';
import HasPermission from 'components/HasPermission';
import useFeatureFlags from 'hooks/useFeatureFlags';

const Text = styled.div`
  flex: 1;
  color: #fff;
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 19px;
  margin-left: 15px;
  display: flex;
  align-items: center;
  transition: all 80ms ease-out;

  ${media.tablet`
    display: none;
  `}
`;

const MenuItemLink = styled(Link)`
  flex: 0 0 auto;
  width: 210px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 8px 10px 16px;
  cursor: pointer;
  border-radius: ${(props) => props.theme.borderRadius};
  transition: background-color 80ms ease-out;

  &:hover,
  &.active,
  &.focus-visible {
    background: rgba(0, 0, 0, 0.7);
  }

  &:not(.active) {
    .cl-icon {
      .cl-icon-primary {
        fill: ${colors.blue400};
      }
      .cl-icon-accent {
        fill: ${colors.teal400};
      }
    }
  }

  &.active {
    .cl-icon {
      .cl-icon-primary {
        fill: ${colors.teal400};
      }
      .cl-icon-accent {
        fill: ${colors.blue400};
      }
    }
  }

  ${media.tablet`
    width: 56px;
    padding-right: 5px;
  `}
`;

type Props = {
  navItem: NavItem;
};

const MenuItem = ({ navItem }: Props) => {
  return useFeatureFlags({
    names: navItem.featureNames ?? [],
    onlyCheckAllowed: navItem.onlyCheckAllowed,
  }) ? (
    <HasPermission action="access" item={{ type: 'route', path: navItem.link }}>
      <MenuItemLink
        to={navItem.link}
        className={`intercom-admin-menu-item-${navItem.name}`}
      >
        <Box
          display="flex"
          flex="0 0 auto"
          alignItems="center"
          justifyContent="center"
          className={navItem.iconName}
        >
          <Icon name={navItem.iconName} />
        </Box>
        <Text>
          <FormattedMessage {...messages[navItem.message]} />
          {!!navItem.count && <CountBadge count={navItem.count} />}
        </Text>
      </MenuItemLink>
    </HasPermission>
  ) : null;
};

export default MenuItem;
