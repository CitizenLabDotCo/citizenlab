import { TAppConfigurationSetting } from 'api/app_configuration/types';
import { IUser, OfferedEarlyAccessFeatures } from 'api/users/types';

// The parts of the signed-in user that early access reads.
export const buildEarlyAccessUser = ({
  optedIn = [],
  offered = { project_backoffice_redesign: 'general' },
  promptsDue = [],
  highestRole = 'admin',
}: {
  optedIn?: TAppConfigurationSetting[];
  offered?: OfferedEarlyAccessFeatures;
  promptsDue?: TAppConfigurationSetting[];
  highestRole?: string;
}) =>
  ({
    data: {
      id: 'user-id',
      type: 'user',
      attributes: {
        early_access_opt_ins: optedIn,
        offered_early_access_features: offered,
        early_access_prompts_due: promptsDue,
        highest_role: highestRole,
      },
    },
  } as unknown as IUser);
