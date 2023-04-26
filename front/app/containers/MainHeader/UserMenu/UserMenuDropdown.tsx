import React, { MouseEvent, KeyboardEvent } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import { Dropdown } from '@citizenlab/cl2-component-library';
import HasPermission from 'components/HasPermission';

// services
import signOut from 'api/authentication/sign_in_out/signOut';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useAuthenticationRequirements from 'api/authentication/authentication_requirements/useAuthenticationRequirements';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// constants
import { GLOBAL_CONTEXT } from 'api/authentication/authentication_requirements/constants';

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
  const { data: authenticationRequirementsResponse } =
    useAuthenticationRequirements(GLOBAL_CONTEXT);

  const isRegisteredUser =
    !isNilOrError(authUser) &&
    !!authenticationRequirementsResponse?.data.attributes.requirements
      .permitted;

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

          {isConfirmedUser && (
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

          {isConfirmedUser && (
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
                triggerAuthenticationFlow();
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

          {isConfirmedUser && !isRegisteredUser && (
            <DropdownListItem
              id="e2e-complete-registration-link"
              onClick={() => {
                triggerAuthenticationFlow();
              }}
              buttonStyle="text"
              bgHoverColor={colors.grey300}
              icon="user-check"
              iconPos="right"
              iconSize="20px"
              padding="11px 11px"
              justify="space-between"
            >
              <FormattedMessage {...messages.completeProfile} />
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
