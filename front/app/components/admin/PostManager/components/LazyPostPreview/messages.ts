import { defineMessages } from 'react-intl';

export default defineMessages({
  edit: {
    id: 'app.components.admin.PostManager.PostPreview.edit',
    defaultMessage: 'Edit',
  },
  delete: {
    id: 'app.components.admin.PostManager.PostPreview.delete',
    defaultMessage: 'Delete',
  },
  deleteInputConfirmation: {
    id: 'app.components.admin.PostManager.PostPreview.deleteInputConfirmation',
    defaultMessage:
      'Are you sure you want to delete this input? This action cannot be undone.',
  },
  deleteInputInTimelineConfirmation: {
    id: 'app.components.admin.PostManager.PostPreview.deleteInputInTimelineConfirmation',
    defaultMessage:
      'Are you sure you want to delete this input? The input will be deleted from all project phases and cannot be recovered.',
  },
  deleteInitiativeConfirmation: {
    id: 'app.components.admin.PostManager.PostPreview.deleteInitiativeConfirmation',
    defaultMessage: 'Are you sure you want to delete this initiative?',
  },
  reactionCounts: {
    id: 'app.components.admin.PostManager.PostPreview.reactionCounts',
    defaultMessage: 'Reaction counts:',
  },
  currentStatus: {
    id: 'app.components.admin.PostManager.PostPreview.currentStatus',
    defaultMessage: 'Current status',
  },
  assignee: {
    id: 'app.components.admin.PostManager.PostPreview.assignee',
    defaultMessage: 'Assignee',
  },
  picks: {
    id: 'app.components.admin.PostManager.PostPreview.picks',
    defaultMessage: 'Picks: {picksNumber}',
  },
  pbItemCountTooltip: {
    id: 'app.components.admin.PostManager.PostPreview.pbItemCountTooltip',
    defaultMessage:
      "The number of times this has been included in other participants' participatory budgets",
  },
  cancelEdit: {
    id: 'app.components.admin.PostManager.PostPreview.cancelEdit',
    defaultMessage: 'Cancel edit',
  },
  noOne: {
    id: 'app.components.admin.PostManager.PostPreview.noOne',
    defaultMessage: 'Unassigned',
  },
  save: {
    id: 'app.components.admin.PostManager.PostPreview.save',
    defaultMessage: 'Save',
  },
  submitError: {
    id: 'app.components.admin.PostManager.PostPreview.submitError',
    defaultMessage: 'Error',
  },
  postedIn: {
    id: 'app.components.admin.PostManager.postedIn',
    defaultMessage: 'Posted in {projectLink}',
  },
  xDaysLeft: {
    id: 'app.components.admin.PostManager.xDaysLeft',
    defaultMessage:
      '{x, plural, =0 {Less than a day} one {One day} other {# days}} left',
  },
  proposedBudgetTitle: {
    id: 'app.components.admin.PostManager.proposedBudgetTitle',
    defaultMessage: 'Proposed budget',
  },
  bodyTitle: {
    id: 'app.components.admin.PostManager.bodyTitle',
    defaultMessage: 'Description',
  },
  formTitle: {
    id: 'app.components.admin.PostManager.formTitle',
    defaultMessage: 'Edit idea',
  },
  optionFormTitle: {
    id: 'app.components.admin.PostManager.optionFormTitle',
    defaultMessage: 'Edit option',
  },
  projectFormTitle: {
    id: 'app.components.admin.PostManager.projectFormTitle',
    defaultMessage: 'Edit project',
  },
  questionFormTitle: {
    id: 'app.components.admin.PostManager.questionFormTitle',
    defaultMessage: 'Edit question',
  },
  issueFormTitle: {
    id: 'app.components.admin.PostManager.issueFormTitle',
    defaultMessage: 'Edit issue',
  },
  contributionFormTitle: {
    id: 'app.components.admin.PostManager.contributionFormTitle',
    defaultMessage: 'Edit contribution',
  },
  submitApiError: {
    id: 'app.components.admin.PostManager.submitApiError',
    defaultMessage:
      'There was an issue submitting the form. Please check for any errors and try again.',
  },
  editedPostSave: {
    id: 'app.components.admin.PostManager.editedPostSave',
    defaultMessage: 'Save',
  },
  fileUploadError: {
    id: 'app.components.admin.PostManager.fileUploadError',
    defaultMessage:
      'One or more files failed to upload. Please check the file size and format and try again.',
  },
});
