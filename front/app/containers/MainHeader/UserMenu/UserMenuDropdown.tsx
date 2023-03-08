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
import { openSignUpInModal } from 'events/openSignUpInModal';

const DropdownListItem = styled(Button)``;

interface Props {
  toggleDropdown: () => void;
  closeDropdown: () => void;
  opened: boolean;
}

const UserMenuDropdown = ({ toggleDropdown, closeDropdown, opened }: Props) => {
  const authUser = useAuthUser();

  const isRegisteredUser =
    !isNilOrError(authUser) && authUser.attributes.registration_completed_at;

  const isConfirmedUser =
    !isNilOrError(authUser) && !authUser.attributes.confirmation_required;

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
      minWidth="220px"
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
              bgHoverColor={colors.grey300}
              icon="shield-checkered"
              iconPos="right"
              iconSize="20px"
              padding="11px 11px"
              justify="space-between"
            >
              <FormattedMessage {...messages.admin} />
            </DropdownListItem>
          </HasPermission>

          {isRegisteredUser && (
            <DropdownListItem
              id="e2e-my-ideas-page-link"
              linkTo={`/profile/${authUser.attributes.slug}`}
              onClick={handleCloseDropdown}
              buttonStyle="text"
              bgHoverColor={colors.grey300}
              icon="user-circle"
              iconPos="right"
              iconSize="20px"
              padding="11px 11px"
              justify="space-between"
            >
              <FormattedMessage {...messages.myProfile} />
            </DropdownListItem>
          )}

          {isRegisteredUser && (
            <DropdownListItem
              id="e2e-profile-edit-link"
              linkTo={'/profile/edit'}
              onClick={handleCloseDropdown}
              buttonStyle="text"
              bgHoverColor={colors.grey300}
              icon="sidebar-settings"
              iconPos="right"
              iconSize="20px"
              padding="11px 11px"
              justify="space-between"
            >
              <FormattedMessage {...messages.editProfile} />
            </DropdownListItem>
          )}

          {!isConfirmedUser && (
            <DropdownListItem
              id="e2e-confirm-email-link"
              onClick={() => {
                openSignUpInModal();
              }}
              buttonStyle="text"
              bgHoverColor={colors.grey300}
              icon="email"
              iconPos="right"
              iconSize="20px"
              padding="11px 11px"
              justify="space-between"
            >
              <FormattedMessage {...messages.confirmEmail} />
            </DropdownListItem>
          )}

          <DropdownListItem
            id="e2e-sign-out-link"
            onClick={signOut}
            buttonStyle="text"
            bgHoverColor={colors.grey300}
            icon="power"
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
