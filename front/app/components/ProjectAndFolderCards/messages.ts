import { defineMessages } from 'react-intl';

export default defineMessages({
  showMore: {
    id: 'app.components.ProjectFolderCards.showMore',
    defaultMessage: 'Show more',
  },
  noProjectYet: {
    id: 'app.components.ProjectFolderCards.noProjectYet',
    defaultMessage: 'There is no project yet',
  },
  stayTuned: {
    id: 'app.components.ProjectFolderCards.stayTuned',
    defaultMessage: 'Stay tuned, a project is going to show up pretty soon.',
  },
  allProjects: {
    id: 'app.containers.ProjectFolderCards.allProjects',
    defaultMessage: 'All projects',
  },
  noProjectsAvailable: {
    id: 'app.components.ProjectFolderCards.noProjectsAvailable',
    defaultMessage: 'No projects available',
  },
  tryChangingFilters: {
    id: 'app.components.ProjectFolderCards.tryChangingFilters',
    defaultMessage: 'Try changing selected filters.',
  },
  a11y_projectsHaveChanged1: {
    id: 'app.containers.SearchInput.a11y_projectsHaveChanged1',
    defaultMessage:
      '{numberOfFilteredResults, plural, =0 {# results have loaded} one {# result has loaded} other {# results have loaded}}.',
  },
});
