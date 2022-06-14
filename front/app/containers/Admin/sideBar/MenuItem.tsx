import React from 'react';
import styled from 'styled-components';
import Link from 'utils/cl-router/Link';
import { NavItem } from '.';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { Icon } from '@citizenlab/cl2-component-library';
import CountBadge from 'components/UI/CountBadge';
import HasPermission from 'components/HasPermission';
import { IUserData, IRole } from 'services/users';
import useAuthUser from 'hooks/useAuthUser';
import { isProjectModerator } from 'services/permissions/roles';
import { isNilOrError } from 'utils/helperUtils';
import useFeatureFlags from 'hooks/useFeatureFlags';

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
  &.active,
  &.focus-visible {
    background: rgba(0, 0, 0, 0.36);

    ${Text} {
      opacity: 1;
    }
  }

  &:not(.active) {
    .cl-icon {
      .cl-icon-primary {
        fill: ${colors.clIconPrimary};
      }
      .cl-icon-accent {
        fill: ${colors.clIconAccent};
      }
    }
  }

  &.active {
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
  navItem: NavItem;
};

const MenuItem = ({ navItem }: Props) => {
  const authUser = useAuthUser();
  const isModerator =
    !isNilOrError(authUser) &&
    (isProjectModerator({ data: authUser }) ||
      isProjectFolderModerator(authUser));
  const renderNavItem = useFeatureFlags({
    names: navItem.featureNames ?? [],
    onlyCheckAllowed: navItem.onlyCheckAllowed,
  });

  // temporarily hiding while we deal with router infinite looping
  if (isModerator && navItem.link === '/admin/messaging') return null;

  return renderNavItem ? (
    <HasPermission action="access" item={{ type: 'route', path: navItem.link }}>
      <MenuItemLink to={navItem.link}>
        <IconWrapper className={navItem.iconName}>
          <Icon name={navItem.iconName} />
        </IconWrapper>
        <Text>
          <FormattedMessage {...messages[navItem.message]} />
          {!!navItem.count && <CountBadge count={navItem.count} />}
        </Text>
        <ArrowIcon name="arrowLeft" />
      </MenuItemLink>
    </HasPermission>
  ) : null;
};

// copied from front/app/modules/commercial/project_folders/permissions/roles.ts
// can't import from modules
function isProjectFolderModerator(user: IUserData, projectFolderId?: string) {
  return !!user.attributes?.roles?.find((role: IRole) => {
    if (projectFolderId) {
      return (
        role.type === 'project_folder_moderator' &&
        role.project_folder_id === projectFolderId
      );
    } else {
      return role.type === 'project_folder_moderator';
    }
  });
}
export default MenuItem;
