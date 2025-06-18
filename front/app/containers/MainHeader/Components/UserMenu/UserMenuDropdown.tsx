import React, { MouseEvent, KeyboardEvent } from 'react';

import { Dropdown, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { GLOBAL_CONTEXT } from 'api/authentication/authentication_requirements/constants';
import useAuthenticationRequirements from 'api/authentication/authentication_requirements/useAuthenticationRequirements';
import signOut from 'api/authentication/sign_in_out/signOut';
import useAuthUser from 'api/me/useAuthUser';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { showOnboarding } from 'containers/Authentication/useSteps/stepConfig/utils';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { usePermission } from 'utils/permissions';

import messages from './messages';

const DropdownListItem = styled(ButtonWithLink)``;

interface Props {
  toggleDropdown: () => void;
  closeDropdown: () => void;
  opened: boolean;
}

const UserMenuDropdown = ({ toggleDropdown, closeDropdown, opened }: Props) => {
  const { data: authUser } = useAuthUser();
  const { data: authenticationRequirementsResponse } =
    useAuthenticationRequirements(GLOBAL_CONTEXT);
  const canAccessAdmin = usePermission({
    item: { type: 'route', path: '/admin' },
    action: 'access',
  });

  const isRegisteredUser =
    !isNilOrError(authUser) &&
    !!authenticationRequirementsResponse?.data.attributes.permitted;

  const isConfirmedUser =
    !isNilOrError(authUser) && !authUser.data.attributes.confirmation_required;

  const showCompleteProfile = isConfirmedUser && !isRegisteredUser;
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
              linkTo={'/admin'}
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

          {isConfirmedUser && (
            <DropdownListItem
              id="e2e-my-ideas-page-link"
              linkTo={`/profile/${authUser.data.attributes.slug}`}
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

          {isConfirmedUser && shouldShowOnboarding && (
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
