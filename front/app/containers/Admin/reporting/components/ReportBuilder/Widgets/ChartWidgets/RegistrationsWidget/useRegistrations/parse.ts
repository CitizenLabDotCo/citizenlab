import { RegistrationsResponse } from 'api/graph_data_units/responseTypes/RegistrationsWidget';

import { calculateConversionRate } from 'components/admin/GraphCards/_utils/parse';

export const parseStats = (
  data: RegistrationsResponse['data']['attributes']
) => {
  return {
    registrations: calculateRegistrationsStats(data),
    registrationRate: calculateRegistrationRateStats(data),
  };
};

const calculateRegistrationsStats = (
  data: RegistrationsResponse['data']['attributes']
) => {
  const registrationsWholePeriod = data[1][0];
  const registrationsPreviousPeriod = data[4]?.[0];

  const registrationsWholePeriodValue = registrationsWholePeriod?.count ?? 0;
  const registrationsPreviousPeriodValue = registrationsPreviousPeriod?.count;

  const registrationsDelta =
    registrationsPreviousPeriodValue !== undefined
      ? registrationsWholePeriodValue - registrationsPreviousPeriodValue
      : undefined;

  return {
    value: registrationsWholePeriodValue,
    delta: registrationsDelta,
  };
};

const calculateRegistrationRateStats = (
  data: RegistrationsResponse['data']['attributes']
) => {
  const visitorsWholePeriod = data[2][0];
  const visitorsPreviousPeriod = data[5]?.[0];

  const registrationsVisitorsWholePeriod = data[3][0];
  const registrationsVisitorsLastPeriod = data[6]?.[0];

  const registrationRateWholePeriod = calculateConversionRate(
    registrationsVisitorsWholePeriod?.count ?? 0,
    visitorsWholePeriod?.count_visitor_id ?? 0
  );

  const registrationsVisitorsLastPeriodValue =
    registrationsVisitorsLastPeriod?.count;

  const visitorsPreviousPeriodValue = visitorsPreviousPeriod?.count_visitor_id;

  const registrationRateRateLastPeriod =
    registrationsVisitorsLastPeriodValue !== undefined
      ? calculateConversionRate(
          registrationsVisitorsLastPeriodValue,
          visitorsPreviousPeriodValue ?? 0
        )
      : undefined;

  const registrationRateDelta =
    registrationRateRateLastPeriod !== undefined
      ? registrationRateWholePeriod - registrationRateRateLastPeriod
      : undefined;

  return {
    value: registrationRateWholePeriod,
    delta: registrationRateDelta,
  };
};
