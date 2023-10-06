// mock data
import appConfigurationEndpoints from '../app/api/app_configuration/__mocks__/_mockServer';
import usersMeEndpoints from '../app/api/me/__mocks__/_mockServer';
import usersMocks from '../app/api/users/__mocks__/_mockServer';

// initiatives mock data
import initiativesEndpoints from '../app/api/initiatives/__mocks__/_mockServer';
import initiativeStatusEndpoints from '../app/api/initiative_statuses/__mocks__/_mockServer';
import initiativeImagesEndpoints from '../app/api/initiative_images/__mocks__/_mockServer';

// ideas mock data
import ideasEndpoints from '../app/api/ideas/__mocks__/_mockServer';
import ideaImagesEndpoints from '../app/api/idea_images/__mocks__/_mockServer'

// projects mock data
import projectsEndpoints from '../app/api/projects/__mocks__/_mockServer';

// phases mock data
import phasesEndpoints from '../app/api/phases/__mocks__/_mockServer';

const endpoints = {
  ...appConfigurationEndpoints,
  ...usersMeEndpoints,
  ...usersMocks,
  ...initiativesEndpoints,
  ...initiativeStatusEndpoints,
  ...initiativeImagesEndpoints,
  ...ideasEndpoints,
  ...ideaImagesEndpoints,
  ...projectsEndpoints,
  ...phasesEndpoints
}

export default endpoints;
