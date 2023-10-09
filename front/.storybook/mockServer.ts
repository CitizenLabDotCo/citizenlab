// mock data
import appConfigurationEndpoints from '../app/api/app_configuration/__mocks__/_mockServer';
import usersMeEndpoints from '../app/api/me/__mocks__/_mockServer';
import usersEndpoints from '../app/api/users/__mocks__/_mockServer';
import authenticationRequirementsEndpoints from '../app/api/authentication/authentication_requirements/__mocks__/_mockServer';

// initiatives mock data
import initiativesEndpoints from '../app/api/initiatives/__mocks__/_mockServer';
import initiativeStatusesEndpoints from '../app/api/initiative_statuses/__mocks__/_mockServer';
import initiativeImagesEndpoints from '../app/api/initiative_images/__mocks__/_mockServer';

// ideas mock data
import ideasEndpoints from '../app/api/ideas/__mocks__/_mockServer';
import ideaStatusesEndpoints from '../app/api/idea_statuses/__mocks__/_mockServer';
import ideaImagesEndpoints from '../app/api/idea_images/__mocks__/_mockServer'

// projects mock data
import projectsEndpoints from '../app/api/projects/__mocks__/_mockServer';

// phases mock data
import phasesEndpoints from '../app/api/phases/__mocks__/_mockServer';

// baskets mock data
import basketsEndpoints from '../app/api/baskets/__mocks__/_mockServer';

const endpoints = {
  ...appConfigurationEndpoints,
  ...usersMeEndpoints,
  ...usersEndpoints,
  ...authenticationRequirementsEndpoints,

  ...initiativesEndpoints,
  ...initiativeStatusesEndpoints,
  ...initiativeImagesEndpoints,

  ...ideasEndpoints,
  ...ideaStatusesEndpoints,
  ...ideaImagesEndpoints,

  ...projectsEndpoints,

  ...phasesEndpoints,
  
  ...basketsEndpoints,
}

export default endpoints;
