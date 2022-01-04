import React, { MouseEvent, KeyboardEvent } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import { Dropdown } from '@citizenlab/cl2-component-library';
import HasPermission from 'components/HasPermission';

// services
import { signOut } from 'services/auth';

// resources
import useAuthUser from 'hooks/useAuthUser';
// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const DropdownListItem = styled(Button)``;

interface Props {
  toggleDropdown: () => void;
  closeDropdown: () => void;
  opened: boolean;
}

const UserMenuDropdown = ({ toggleDropdown, closeDropdown, opened }: Props) => {
  const authUser = useAuthUser();

  const handleToggleDropdown = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    toggleDropdown();
  };

  const handleCloseDropdown = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    closeDropdown();
  };

  return (
    <Dropdown
      id="e2e-user-menu-dropdown"
      width="220px"
      mobileWidth="220px"
      top="68px"
      right="-12px"
      mobileRight="-5px"
      opened={opened}
      onClickOutside={handleToggleDropdown}
      content={
        <>
          <HasPermission
            item={{ type: 'route', path: '/admin/dashboard' }}
            action="access"
          >
            <DropdownListItem
              id="admin-link"
              linkTo={'/admin/dashboard'}
              onClick={handleCloseDropdown}
              buttonStyle="text"
              bgHoverColor={colors.clDropdownHoverBackground}
              icon="admin"
              iconAriaHidden
              iconPos="right"
              iconSize="20px"
              padding="11px 11px"
              justify="space-between"
            >
              <FormattedMessage {...messages.admin} />
            </DropdownListItem>
          </HasPermission>

          {!isNilOrError(authUser) && (
            <DropdownListItem
              id="e2e-my-ideas-page-link"
              linkTo={`/profile/${authUser.attributes.slug}`}
              onClick={handleCloseDropdown}
              buttonStyle="text"
              bgHoverColor={colors.clDropdownHoverBackground}
              icon="profile1"
              iconAriaHidden
              iconPos="right"
              iconSize="20px"
              padding="11px 11px"
              justify="space-between"
            >
              <FormattedMessage {...messages.myProfile} />
            </DropdownListItem>
          )}

          <DropdownListItem
            id="e2e-profile-edit-link"
            linkTo={'/profile/edit'}
            onClick={handleCloseDropdown}
            buttonStyle="text"
            bgHoverColor={colors.clDropdownHoverBackground}
            icon="settings"
            iconAriaHidden
            iconPos="right"
            iconSize="20px"
            padding="11px 11px"
            justify="space-between"
          >
            <FormattedMessage {...messages.editProfile} />
          </DropdownListItem>

          <DropdownListItem
            id="e2e-sign-out-link"
            onClick={signOut}
            buttonStyle="text"
            bgHoverColor={colors.clDropdownHoverBackground}
            icon="power"
            iconAriaHidden
            iconPos="right"
            iconSize="20px"
            padding="11px 11px"
            justify="space-between"
          >
            <FormattedMessage {...messages.signOut} />
          </DropdownListItem>
        </>
      }
    />
  );
};

export default UserMenuDropdown;
