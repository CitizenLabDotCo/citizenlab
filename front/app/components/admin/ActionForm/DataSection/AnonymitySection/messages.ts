import { defineMessages } from 'react-intl';

export default defineMessages({
  allDataLabel: {
    id: 'app.components.admin.ActionForm.DataSection.AnonymitySection.allDataLabel',
    defaultMessage:
      'Link submissions to the participant’s profile (recommended)',
  },
  demographicsOnlyLabel: {
    id: 'app.components.admin.ActionForm.DataSection.AnonymitySection.demographicsOnlyLabel',
    defaultMessage: 'Keep demographics in results, but unlink personal info',
  },
  demographicsOnlyWarning: {
    id: 'app.components.admin.ActionForm.DataSection.AnonymitySection.demographicsOnlyWarning',
    defaultMessage:
      'Personal info will not be stored with submissions and cannot be recovered later.',
  },
  anonymousLabel: {
    id: 'app.components.admin.ActionForm.DataSection.AnonymitySection.anonymousLabel',
    defaultMessage: 'Fully anonymous — unlink personal info and demographics',
  },
  anonymousWarning: {
    id: 'app.components.admin.ActionForm.DataSection.AnonymitySection.anonymousWarning',
    defaultMessage:
      'Neither personal info nor demographics will be stored with submissions, and cannot be recovered later.',
  },
  anonymityInResults: {
    id: 'app.components.admin.ActionForm.DataSection.AnonymitySection.anonymityInResults',
    defaultMessage: 'Anonymity in results',
  },
  anonymityExplanation: {
    id: 'app.components.admin.ActionForm.DataSection.AnonymitySection.anonymityExplanation',
    defaultMessage:
      'Independent of what you ask above: you can collect a name yet still keep the submission unlinked from the participant’s profile.',
  },
});
