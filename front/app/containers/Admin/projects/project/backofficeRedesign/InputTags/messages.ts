import { defineMessages } from 'react-intl';

export default defineMessages({
  tagsTitle: {
    id: 'app.containers.Admin.projects.project.phaseInputTagsTitle',
    defaultMessage: '{term} tags',
  },
  tagCount: {
    id: 'app.containers.Admin.projects.project.inputTagCount',
    defaultMessage: '{count, plural, one {# tag} other {# tags}}',
  },
  sharedTags: {
    id: 'app.containers.Admin.projects.project.sharedInputTags',
    defaultMessage:
      'Shared with “{methods}”. Changes apply to {count, plural, one {both methods} other {all these methods}}.',
  },
  saveFailed: {
    id: 'app.containers.Admin.projects.project.inputTagsSaveFailed',
    defaultMessage: 'The tags could not be saved. Please try again.',
  },
  back: {
    id: 'app.containers.Admin.projects.project.backFromInputTags',
    defaultMessage: 'Back to phase setup',
  },
});
