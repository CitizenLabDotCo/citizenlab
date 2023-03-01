import { useState, useEffect } from 'react';
import {
  getInitiativeActionDescriptors,
  IInitiativeAction,
} from 'services/initiatives';
import { isNilOrError } from 'utils/helperUtils';
import { ActionPermission } from 'services/actionTakingRules';
import { authUserStream } from 'services/auth';
import { combineLatest } from 'rxjs';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

export type IInitiativeDisabledReason = 'notPermitted';

export default function useInitiativesPermissions(action: IInitiativeAction) {
  const [actionPermission, setActionPermission] = useState<
    ActionPermission<IInitiativeDisabledReason> | null | undefined
  >(undefined);
  const { data: appConfiguration } = useAppConfiguration();

  useEffect(() => {
    const subscription = combineLatest([
      getInitiativeActionDescriptors().observable,

      authUserStream().observable,
    ]).subscribe(([actionDescriptors, authUser]) => {
      if (!isNilOrError(appConfiguration) && !isNilOrError(actionDescriptors)) {
        const actionDescriptor = actionDescriptors[action];

        if (actionDescriptor.enabled) {
          setActionPermission({
            show: true,
            enabled: true,
            disabledReason: null,
            action: null,
          });
        } else {
          switch (actionDescriptor.disabled_reason) {
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
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appConfiguration]);

  return { show: true, enabled: true, disabledReason: null, action: null };
}
