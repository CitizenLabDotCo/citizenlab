import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { isNil } from 'utils/helperUtils';
import useFeatureFlag from './useFeatureFlag';

export default function useTotalSeats() {
  const { data: appConfiguration } = useAppConfiguration();
  const seatBasedBillingEnabled = useFeatureFlag({
    name: 'seat_based_billing',
  });

  if (isNil(appConfiguration)) return null;

  const core = appConfiguration.data.attributes.settings.core;

  const additionalAdmins = seatBasedBillingEnabled
    ? core.additional_admins_number ?? 0
    : 0;
  const additionalModerators = seatBasedBillingEnabled
    ? core.additional_moderators_number ?? 0
    : 0;

  return {
    totalAdminSeats: isNil(core.maximum_admins_number)
      ? null
      : core.maximum_admins_number + additionalAdmins,
    totalModeratorSeats: isNil(core.maximum_moderators_number)
      ? null
      : core.maximum_moderators_number + additionalModerators,
  };
}
