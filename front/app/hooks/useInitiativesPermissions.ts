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
              disabledReason: null,
              authenticationRequirements: 'complete_registration',
            });
            break;
          }
          case 'user_not_verified':
            if (!authUser) {
              setActionPermission({
                show: true,
                enabled: 'maybe',
                disabledReason: null,
                authenticationRequirements: 'sign_in_up_and_verify',
              });
            } else {
              setActionPermission({
                show: true,
                enabled: 'maybe',
                disabledReason: null,
                authenticationRequirements: 'verify',
              });
            }
            break;
          case 'user_not_signed_in':
            setActionPermission({
              show: true,
              enabled: 'maybe',
              disabledReason: null,
              authenticationRequirements: 'sign_in_up',
            });
            break;
          case 'user_not_active':
            setActionPermission({
              show: true,
              enabled: 'maybe',
              disabledReason: null,
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
