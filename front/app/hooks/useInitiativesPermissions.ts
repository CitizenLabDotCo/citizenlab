import { useState, useEffect } from 'react';
import { IInitiativeActionDescriptorName } from 'api/initiative_action_descriptors/types';
import useInitativeActionDescriptors from 'api/initiative_action_descriptors/useInitiativeActionDescriptors';
import { ActionPermission } from 'utils/actionTakingRules';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';

export type InitiativePermissionsDisabledReason =
  // Only the ones set below via setActionPermissions's disabledReason
  'not_permitted' | 'not_in_group';

export default function useInitiativesPermissions(
  actionDescriptorName: IInitiativeActionDescriptorName
) {
  const [actionPermission, setActionPermission] =
    useState<ActionPermission<InitiativePermissionsDisabledReason> | null>(
      null
    );
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
          case 'missing_data': {
            setActionPermission({
              show: true,
              enabled: 'maybe',
              disabledReason: null,
              authenticationRequirements: 'complete_registration',
            });
            break;
          }
          case 'not_verified':
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
          case 'not_signed_in':
            setActionPermission({
              show: true,
              enabled: 'maybe',
              disabledReason: null,
              authenticationRequirements: 'sign_in_up',
            });
            break;
          case 'not_active':
            setActionPermission({
              show: true,
              enabled: 'maybe',
              disabledReason: null,
              authenticationRequirements: 'complete_registration',
            });
            break;
          case 'not_in_group':
            setActionPermission({
              show: true,
              enabled: false,
              disabledReason: 'not_in_group',
              authenticationRequirements: null,
            });
            break;
          default:
            setActionPermission({
              show: true,
              enabled: false,
              disabledReason: 'not_permitted',
              authenticationRequirements: null,
            });
        }
      }
    }
  }, [appConfiguration, actionDescriptor, authUser]);

  return actionPermission;
}
