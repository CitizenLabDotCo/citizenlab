import { rest } from 'msw';

// mock data
import appConfigurationEndpoints from '../app/api/app_configuration/__mocks__/_mockServer';
import usersMeEndpoints from '../app/api/me/__mocks__/_mockServer';

const endpoints = [
  ...appConfigurationEndpoints,
  ...usersMeEndpoints
];

export default endpoints;
