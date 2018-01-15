/*
 * IdeasProjectSelect Messages
 *
 * This contains all the text for the IdeasProjectSelect component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  pageTitle: {
    id: 'app.containers.IdeasProjectSelect.pageTitle',
    defaultMessage: 'Select your project',
  },
  cityProjects: {
    id: 'app.containers.IdeasProjectSelect.cityProjects',
    defaultMessage: 'City projects',
  },
  cityProjectsExplanation: {
    id: 'app.containers.IdeasProjectSelect.cityProjectsExplanation',
    defaultMessage: 'These are some projects {orgName} is currently working on',
  },
  openProject: {
    id: 'app.containers.IdeasProjectSelect.openProject',
    defaultMessage: 'Open ideas',
  },
  openProjectExplanation: {
    id: 'app.containers.IdeasProjectSelect.openProjectExplanation',
    defaultMessage: 'Have an idea that doesn\'t fit in? Try your luck and get enough votes to put it on the agenda!',
  },
});
