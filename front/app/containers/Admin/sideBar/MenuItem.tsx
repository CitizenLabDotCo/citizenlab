import React from 'react';

import { media, colors, Icon, Box } from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlags from 'hooks/useFeatureFlags';

import CountBadge from 'components/UI/CountBadge';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { usePermission } from 'utils/permissions';
import { isSuperAdmin } from 'utils/permissions/roles';

import messages from './messages';
import { NavItem } from './navItems';

const Text = styled.div`
  flex: 1;
  color: #fff;
  font-size: 15px;
  font-weight: 400;
  margin-left: 15px;
  display: flex;
  align-items: center;
  transition: all 80ms ease-out;

  ${media.tablet`
    display: none;
  `}
`;

const MenuItemLink = styled(Link)<{ active: boolean }>`
  flex: 0 0 auto;
  width: 224px;
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
  &.disabled {
    pointer-events: none;
    opacity: 0.5;
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

  ${({ active }) =>
    active
      ? `
    background: rgba(0, 0, 0, 0.7);
    .cl-icon {
      .cl-icon-primary {
        fill: ${colors.teal400};
      }
      .cl-icon-accent {
        fill: ${colors.blue400};
      }
    }
  `
      : ''}

  ${media.tablet`
    width: 56px;
    padding-right: 5px;
  `}
`;

type Props = {
  navItem: NavItem;
};

const MenuItem = ({ navItem }: Props) => {
  const featuresEnabled = useFeatureFlags({
    names: navItem.featureNames ?? [],
    onlyCheckAllowed: navItem.onlyCheckAllowed,
  });
  const { data: user } = useAuthUser();
  const { pathname } = useLocation();

  const hasPermission = usePermission({
    action: 'access',
    item: { type: 'route', path: navItem.link },
  });

  const enabledAndHasPermission = featuresEnabled && hasPermission;

  if (navItem.name === 'reporting') {
    if (!isSuperAdmin(user) && !enabledAndHasPermission) {
      // Super admins need to have access to the global report builder
      return null;
    }
  } else {
    if (!enabledAndHasPermission) return null;
  }

  const inspirationHubActive =
    navItem.link.startsWith('/admin/inspiration-hub') &&
    pathname.includes('/admin/inspiration-hub');

  return (
    <MenuItemLink
      to={navItem.link}
      className={`intercom-admin-menu-item-${navItem.name}`}
      active={inspirationHubActive}
    >
      <>
        <Box
          display="flex"
          flex="0 0 auto"
          alignItems="center"
          justifyContent="center"
          className={navItem.iconName}
        >
          <Icon name={navItem.iconName} height="20px" />
        </Box>
        <Text>
          <FormattedMessage {...messages[navItem.message]} />
          {!!navItem.count && <CountBadge count={navItem.count} />}
        </Text>
      </>
    </MenuItemLink>
  );
};

export default MenuItem;
