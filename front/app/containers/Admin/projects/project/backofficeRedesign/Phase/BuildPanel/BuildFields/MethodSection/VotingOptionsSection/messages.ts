import { defineMessages } from 'react-intl';

export default defineMessages({
  votingOptionsSection: {
    id: 'app.containers.Admin.projects.project.votingOptionsSection',
    defaultMessage: 'Options to vote on',
  },
  addVotingOption: {
    id: 'app.containers.Admin.projects.project.addVotingOption',
    defaultMessage: 'Add input',
  },
  importVotingOptions: {
    id: 'app.containers.Admin.projects.project.importVotingOptions',
    defaultMessage: 'Import options',
  },
  importFromPreviousPhase: {
    id: 'app.containers.Admin.projects.project.importFromPreviousPhase',
    defaultMessage: 'Import from previous phase',
  },
  linkPhaseDescription: {
    id: 'app.containers.Admin.projects.project.linkPhaseDescription',
    defaultMessage:
      'Pick an earlier phase of this project. Its inputs become options to vote on, keeping their comments and reactions.',
  },
  linkPhaseLabel: {
    id: 'app.containers.Admin.projects.project.linkPhaseLabel',
    defaultMessage: 'Phase',
  },
  nInputsToLink: {
    id: 'app.containers.Admin.projects.project.nInputsToLink',
    defaultMessage:
      '{count, plural, =0 {All inputs of this phase are already options} one {# input will be added} other {# inputs will be added}}',
  },
  linkCancel: {
    id: 'app.containers.Admin.projects.project.linkCancel',
    defaultMessage: 'Cancel',
  },
  linkInputs: {
    id: 'app.containers.Admin.projects.project.linkInputs',
    defaultMessage: 'Import',
  },
  createForm: {
    id: 'app.containers.Admin.projects.project.createForm',
    defaultMessage: 'Create form',
  },
  nVotingOptions: {
    id: 'app.containers.Admin.projects.project.nVotingOptions',
    defaultMessage: '{count, plural, one {# option} other {# options}}',
  },
});
