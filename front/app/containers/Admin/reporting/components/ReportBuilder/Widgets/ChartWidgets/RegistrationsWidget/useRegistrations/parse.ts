import { RegistrationsResponse } from 'api/graph_data_units/responseTypes/RegistrationsWidget';

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
    value: Math.round(registration_rate_whole_period * 100),
    delta:
      registration_rate_compared_period !== undefined
        ? Math.round(
            (registration_rate_whole_period -
              registration_rate_compared_period) *
              100
          )
        : undefined,
  };
};
