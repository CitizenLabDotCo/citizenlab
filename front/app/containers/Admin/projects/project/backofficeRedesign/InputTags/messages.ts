import { defineMessages } from 'react-intl';

export default defineMessages({
  tagsTitle: {
    id: 'app.containers.Admin.projects.project.phaseInputTagsTitle2',
    defaultMessage: `{inputTerm, select,
      idea {Idea tags}
      option {Option tags}
      project {Project tags}
      question {Question tags}
      issue {Issue tags}
      contribution {Contribution tags}
      proposal {Proposal tags}
      initiative {Initiative tags}
      petition {Petition tags}
      comment {Comment tags}
      response {Response tags}
      suggestion {Suggestion tags}
      topic {Topic tags}
      post {Post tags}
      story {Story tags}
      observation {Observation tags}
      other {Input tags}
    }`,
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
