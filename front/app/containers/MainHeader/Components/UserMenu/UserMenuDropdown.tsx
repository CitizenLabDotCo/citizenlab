import React, { MouseEvent, KeyboardEvent } from 'react';

import { Dropdown, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { GLOBAL_CONTEXT } from 'api/authentication/authentication_requirements/constants';
import useAuthenticationRequirements from 'api/authentication/authentication_requirements/useAuthenticationRequirements';
import signOut from 'api/authentication/sign_in_out/signOut';
import { IUser } from 'api/users/types';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { showOnboarding } from 'containers/Authentication/useSteps/stepConfig/utils';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import messages from './messages';

const DropdownListItem = styled(ButtonWithLink)``;

interface Props {
  toggleDropdown: () => void;
  closeDropdown: () => void;
  authUser: IUser;
  opened: boolean;
}

const UserMenuDropdown = ({
  toggleDropdown,
  closeDropdown,
  authUser,
  opened,
}: Props) => {
  const { data: authenticationRequirementsResponse } =
    useAuthenticationRequirements(GLOBAL_CONTEXT);
  const canAccessAdmin = usePermission({
    item: { type: 'route', path: '/admin' },
    action: 'access',
  });

  const authRequirements = authenticationRequirementsResponse?.data.attributes;
  const isRegisteredUser = !!authRequirements?.permitted;
  const userRequiresEmailConfirmation =
    authRequirements?.requirements.authentication.email_action_required ===
    'confirm_new_email';
  const showCompleteProfile =
    !userRequiresEmailConfirmation && !isRegisteredUser;

  const shouldShowOnboarding =
    authenticationRequirementsResponse && !showCompleteProfile
      ? showOnboarding(
          authenticationRequirementsResponse.data.attributes.requirements
        )
      : false;

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
          {canAccessAdmin && (
            <DropdownListItem
              id="admin-link"
              to="/admin"
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
          )}

          {!userRequiresEmailConfirmation && (
            <DropdownListItem
              id="e2e-my-ideas-page-link"
              to="/profile/$userId"
              params={{ userId: authUser.data.id }}
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

          {!userRequiresEmailConfirmation && (
            <DropdownListItem
              id="e2e-profile-edit-link"
              to="/profile/edit"
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

          {userRequiresEmailConfirmation && (
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

          {showCompleteProfile && (
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

          {userRequiresEmailConfirmation && shouldShowOnboarding && (
            <DropdownListItem
              onClick={() => {
                triggerAuthenticationFlow();
              }}
              buttonStyle="text"
              bgHoverColor={colors.grey300}
              icon="basket-checkmark"
              iconPos="right"
              iconSize="20px"
              padding="11px 11px"
              justify="space-between"
              id="e2e-complete-onboarding-link"
            >
              <FormattedMessage {...messages.completeOnboarding} />
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
