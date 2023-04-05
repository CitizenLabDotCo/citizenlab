import { useState, useEffect } from 'react';
import { IInitiativeAction } from 'api/initiative_action_descriptors/types';
import useInitiativeActionDescriptors from 'api/initiative_action_descriptors/useInitiativeActionDescriptors';
import { isNilOrError } from 'utils/helperUtils';
import { ActionPermission } from 'services/actionTakingRules';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from './useAuthUser';
import { useLocation } from 'react-router-dom';

export type IInitiativeDisabledReason = 'notPermitted';

export default function useInitiativesPermissions(action: IInitiativeAction) {
  const location = useLocation();
  const [actionPermission, setActionPermission] = useState<
    ActionPermission<IInitiativeDisabledReason> | null | undefined
  >(undefined);
  const { data: appConfiguration } = useAppConfiguration();
  const { data: actionDescriptors } = useInitiativeActionDescriptors();
  const authUser = useAuthUser();

  useEffect(() => {
    if (appConfiguration && actionDescriptors) {
      const actionDescriptor = actionDescriptors.data.attributes[action];

      if (actionDescriptor?.enabled) {
        setActionPermission({
          show: true,
          enabled: true,
          disabledReason: null,
          action: null,
        });
      } else {
        switch (actionDescriptor?.disabled_reason) {
          case 'not_verified':
            if (isNilOrError(authUser)) {
              setActionPermission({
                show: true,
                enabled: 'maybe',
                disabledReason: null,
                action: 'sign_in_up_and_verify',
              });
            } else {
              setActionPermission({
                show: true,
                enabled: 'maybe',
                disabledReason: null,
                action: 'verify',
              });
            }
            break;
          case 'not_signed_in':
            setActionPermission({
              show: true,
              enabled: 'maybe',
              disabledReason: null,
              action: 'sign_in_up',
            });
            break;
          default:
            setActionPermission({
              show: true,
              enabled: false,
              disabledReason: 'notPermitted',
              action: null,
            });
        }
      }
    }
  }, [appConfiguration, actionDescriptors, authUser, action, location]);

  return actionPermission;
}
