import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { isNil } from 'utils/helperUtils';

export const useAvailableSeats = () => {
  const { data: appConfiguration } = useAppConfiguration();

  if (isNil(appConfiguration)) return null;

  const core = appConfiguration.data.attributes.settings.core;

  return {
    availableAdminSeats:
      core.maximum_admins_number &&
      core.maximum_admins_number + (core.additional_admins_number ?? 0),
    availableModeratorSeats:
      core.maximum_moderators_number &&
      core.maximum_moderators_number + (core.additional_moderators_number ?? 0),
  };
};
