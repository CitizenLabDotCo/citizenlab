/*
 * IdeasProjectSelect Messages
 *
 * This contains all the text for the IdeasProjectSelect component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  pageTitle: {
    id: 'app.containers.IdeasProjectSelect.pageTitle',
    defaultMessage: "What's your idea about?",
  },
  cityProjects: {
    id: 'app.containers.IdeasProjectSelect.cityProjects',
    defaultMessage:
      '{orgType, select, generic {Projects} other {City projects}}',
  },
  cityProjectsExplanation: {
    id: 'app.containers.IdeasProjectSelect.cityProjectsExplanation',
    defaultMessage:
      'These are the projects {orgName} is currently working on. Contribute by giving your input.',
  },
  openProject: {
    id: 'app.containers.IdeasProjectSelect.openProject',
    defaultMessage: 'Something else',
  },
  openProjectExplanation: {
    id: 'app.containers.IdeasProjectSelect.openProjectExplanation',
    defaultMessage:
      'Have an idea about something else? See whether {orgType, select, generic {others} other {fellow citizens}} agree and make {orgName} notice!',
  },
  continueButton: {
    id: 'app.containers.IdeasProjectSelect.continueButton',
    defaultMessage: 'Continue',
  },
  loadMore: {
    id: 'app.containers.IdeasProjectSelect.loadMore',
    defaultMessage: 'Load more',
  },
  postingPossibleFuture: {
    id: 'app.containers.IdeasProjectSelect.postingPossibleFuture',
    defaultMessage:
      'Adding ideas to this project will be possible from {date}.',
  },
  postingNotPossible: {
    id: 'app.containers.IdeasProjectSelect.postingNotPossible',
    defaultMessage: 'This project does currently not accept new ideas.',
  },
  postingPossibleBecauseAdmin: {
    id: 'app.containers.IdeasProjectSelect.postingPossibleBecauseAdmin',
    defaultMessage: 'Only administrators can currently post in this project.',
  },
  postingDisabledNoPermissions: {
    id: 'app.containers.IdeasProjectSelect.postingDisabledNoPermissions',
    defaultMessage: "You don't have the rights to post in this project.",
  },
  postingDisabledMaybeNoPermissions: {
    id: 'app.containers.IdeasProjectSelect.postingDisabledMaybeNoPermissions',
    defaultMessage:
      'Only certain users can post in this project. Please sign in first.',
  },
  noProjects: {
    id: 'app.containers.IdeasProjectSelect.noProjects',
    defaultMessage: 'Sorry, there currently are no projects to add ideas to.',
  },
});
