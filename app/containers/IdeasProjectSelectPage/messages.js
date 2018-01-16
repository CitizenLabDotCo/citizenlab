/*
 * IdeasProjectSelect Messages
 *
 * This contains all the text for the IdeasProjectSelect component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  pageTitle: {
    id: 'app.containers.IdeasProjectSelect.pageTitle',
    defaultMessage: 'What\'s your idea about?',
  },
  cityProjects: {
    id: 'app.containers.IdeasProjectSelect.cityProjects',
    defaultMessage: '{orgType, select, generic {Projects} other {City projects}}',
  },
  cityProjectsExplanation: {
    id: 'app.containers.IdeasProjectSelect.cityProjectsExplanation',
    defaultMessage: 'These are the projects {orgName} is currently working on. Contribute by giving your input.',
  },
  openProject: {
    id: 'app.containers.IdeasProjectSelect.openProject',
    defaultMessage: 'Something else',
  },
  openProjectExplanation: {
    id: 'app.containers.IdeasProjectSelect.openProjectExplanation',
    defaultMessage: 'Have an idea about something else? See whether {orgType, select, generic {others} other {fellow citizens}} agree and make {orgName} notice!',
  },
  continueButton: {
    id: 'app.containers.IdeasProjectSelect.continueButton',
    defaultMessage: 'Continue',
  },
});
