import { Response, Stats } from './typings';
import { getConversionRate } from '../useRegistrations/parse';

export const parseStats = (data: Response['data']): Stats => {
  const activeUsersWholePeriod = data[1][0];
  const activeUsersLastPeriod = data[2][0];
  const visitsWholePeriod = data[3][0];
  const visitsLastPeriod = data[4][0];

  const conversionRateWholePeriod = getConversionRate(
    activeUsersWholePeriod.count_dimension_user_id,
    visitsWholePeriod.count_visitor_id
  );

  const conversionRateLastPeriod = getConversionRate(
    activeUsersLastPeriod.count_dimension_user_id,
    visitsLastPeriod.count_visitor_id
  );

  return {
    activeUsers: {
      value: activeUsersWholePeriod.count_dimension_user_id.toString(),
      lastPeriod: activeUsersLastPeriod.count_dimension_user_id.toString(),
    },
    conversionRate: {
      value: conversionRateWholePeriod,
      lastPeriod: conversionRateLastPeriod,
    },
  };
};
