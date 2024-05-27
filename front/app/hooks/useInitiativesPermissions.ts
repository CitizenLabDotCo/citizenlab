import { useState, useEffect } from 'react';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import {
  IInitiativeActionDescriptorName,
  InitiativeDisabledReason,
} from 'api/initiative_action_descriptors/types';
import useInitativeActionDescriptors from 'api/initiative_action_descriptors/useInitiativeActionDescriptors';
import useAuthUser from 'api/me/useAuthUser';

import { ActionPermission } from 'utils/actionTakingRules';

export default function useInitiativesPermissions(
  actionDescriptorName: IInitiativeActionDescriptorName
) {
  const [actionPermission, setActionPermission] =
    useState<ActionPermission<InitiativeDisabledReason> | null>(null);
  const { data: appConfiguration } = useAppConfiguration();
  const { data: actionDescriptors } = useInitativeActionDescriptors();
  const { data: authUser } = useAuthUser();
  const actionDescriptor =
    actionDescriptors?.data.attributes[actionDescriptorName];

  useEffect(() => {
    if (appConfiguration && actionDescriptor) {
      if (actionDescriptor.enabled) {
        setActionPermission({
          show: true,
          enabled: true,
          disabledReason: null,
          authenticationRequirements: null,
        });
      } else {
        switch (actionDescriptor.disabled_reason) {
          case 'user_missing_requirements': {
            setActionPermission({
              show: true,
              enabled: 'maybe',
              disabledReason: 'user_missing_requirements',
              authenticationRequirements: 'complete_registration',
            });
            break;
          }
          case 'user_not_verified':
            // TODO: This is not possible in the current state of the app - should the backend return not_signed_in_requires_verification instead?
            if (!authUser) {
              setActionPermission({
                show: true,
                enabled: 'maybe',
                disabledReason: 'user_not_verified',
                authenticationRequirements: 'sign_in_up_and_verify',
              });
            } else {
              setActionPermission({
                show: true,
                enabled: 'maybe',
                disabledReason: 'user_not_verified',
                authenticationRequirements: 'verify',
              });
            }
            break;
          case 'user_not_signed_in':
            setActionPermission({
              show: true,
              enabled: 'maybe',
              disabledReason: 'user_not_signed_in',
              authenticationRequirements: 'sign_in_up',
            });
            break;
          case 'user_not_active':
            setActionPermission({
              show: true,
              enabled: 'maybe',
              disabledReason: 'user_not_active',
              authenticationRequirements: 'complete_registration',
            });
            break;
          case 'user_not_in_group':
            setActionPermission({
              show: true,
              enabled: false,
              disabledReason: 'user_not_in_group',
              authenticationRequirements: null,
            });
            break;
          default:
            setActionPermission({
              show: true,
              enabled: false,
              disabledReason: 'user_not_permitted',
              authenticationRequirements: null,
            });
        }
      }
    }
  }, [appConfiguration, actionDescriptor, authUser]);

  return actionPermission;
}
