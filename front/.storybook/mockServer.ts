// mock data
import appConfigurationEndpoints from '../app/api/app_configuration/__mocks__/_mockServer';
import usersMeEndpoints from '../app/api/me/__mocks__/_mockServer';
import usersMocks from '../app/api/users/__mocks__/_mockServer';
import initiativesEndpoints from '../app/api/initiatives/__mocks__/_mockServer';
import initiativeStatusEndpoints from '../app/api/initiative_statuses/__mocks__/_mockServer';
import initiativeImagesEndpoints from '../app/api/initiative_images/__mocks__/_mockServer';

const endpoints = {
  ...appConfigurationEndpoints,
  ...usersMeEndpoints,
  ...usersMocks,
  ...initiativesEndpoints,
  ...initiativeStatusEndpoints,
  ...initiativeImagesEndpoints
}

export default endpoints;
