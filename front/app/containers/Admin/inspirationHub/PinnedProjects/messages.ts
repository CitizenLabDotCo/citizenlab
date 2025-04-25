import { defineMessages } from 'react-intl';

export default defineMessages({
  highlighted: {
    id: 'app.containers.Admin.inspirationHub.Highlighted',
    defaultMessage: 'Highlighted',
  },
  country: {
    id: 'app.containers.Admin.inspirationHub.PinnedProjects.country',
    defaultMessage: 'Country',
  },
  chooseCountry: {
    id: 'app.containers.Admin.inspirationHub.PinnedProjects.chooseCountry',
    defaultMessage: 'Please choose a country to see pinned projects',
  },
  noPinnedProjectsFound: {
    id: 'app.containers.Admin.inspirationHub.PinnedProjects.noPinnedProjectsFound',
    defaultMessage:
      'No pinned projects found for this country. Change the country to see pinned projects for other countries',
  },
  changeTheCountry: {
    id: 'app.containers.Admin.inspirationHub.PinnedProjects.wantToSeeMore',
    defaultMessage: 'Change the country to see more pinned projects',
  },
});
