import { InternalAdoptionResponse } from 'api/graph_data_units/responseTypes/InternalAdoptionWidget';

import { Stats } from '../typings';

export const parseStats = (
  attributes: InternalAdoptionResponse['data']['attributes']
): Stats => {
  const {
    active_admins_count,
    active_moderators_count,
    total_admin_pm_count,
    active_admins_compared,
    active_moderators_compared,
    total_admin_pm_compared,
  } = attributes;

  return {
    activeAdmins: {
      value: active_admins_count,
      change: getDelta(active_admins_count, active_admins_compared),
    },
    activeModerators: {
      value: active_moderators_count,
      change: getDelta(active_moderators_count, active_moderators_compared),
    },
    totalAdminPm: {
      value: total_admin_pm_count,
      change: getDelta(total_admin_pm_count, total_admin_pm_compared),
    },
  };
};

const getDelta = (
  current: number,
  compared?: number | undefined
): number | undefined => {
  if (compared === undefined) {
    return undefined;
  }
  return current - compared;
};
