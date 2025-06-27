import { RegistrationsResponse } from 'api/graph_data_units/responseTypes/RegistrationsWidget';

import { toPercentage } from '../../utils';

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
  const { registrations_whole_period, registrations_compared_period } = data;

  const registrationsDelta =
    registrations_compared_period !== undefined
      ? registrations_whole_period - registrations_compared_period
      : undefined;

  return {
    value: registrations_whole_period,
    delta: registrationsDelta,
  };
};

const calculateRegistrationRateStats = (
  data: RegistrationsResponse['data']['attributes']
) => {
  const { registration_rate_whole_period, registration_rate_compared_period } =
    data;

  return {
    value: toPercentage(registration_rate_whole_period),
    delta:
      registration_rate_compared_period !== undefined
        ? toPercentage(registration_rate_whole_period) -
          toPercentage(registration_rate_compared_period)
        : undefined,
  };
};
