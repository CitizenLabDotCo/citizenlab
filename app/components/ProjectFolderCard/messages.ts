import { defineMessages } from 'react-intl';

export default defineMessages({
  idea: {
    id: 'app.components.ProjectFolderCard.idea',
    defaultMessage: 'idea',
  },
  ideas: {
    id: 'app.components.ProjectFolderCard.ideas',
    defaultMessage: 'ideas',
  },
  xIdeas: {
    id: 'app.components.ProjectFolderCard.xIdeas',
    defaultMessage: '{ideasCount, plural, no {# ideas} one {# idea} other {# ideas}}',
  },
  xComments: {
    id: 'app.components.ProjectFolderCard.xComments',
    defaultMessage: '{commentsCount, plural, no {# comments} one {# comments} other {# comments}}',
  },
  archived: {
    id: 'app.components.ProjectFolderCard.archived',
    defaultMessage: 'Archived',
  },
  finished: {
    id: 'app.components.ProjectFolderCard.finished',
    defaultMessage: 'Finished',
  },
  remaining: {
    id: 'app.components.ProjectFolderCard.remaining',
    defaultMessage: '{timeRemaining} remaining',
  },
  learnMore: {
    id: 'app.components.ProjectFolderCard.learnMore',
    defaultMessage: 'Learn more',
  },
  a11y_projectTitle: {
    id: 'app.components.ProjectFolderCard.a11y_projectTitle',
    defaultMessage: 'Project title: ',
  },
  a11y_projectDescription: {
    id: 'app.components.ProjectFolderCard.a11y_projectDescription',
    defaultMessage: 'Project description: ',
  }
});
