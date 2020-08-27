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
  deleteIdeaConfirmation: {
    id: 'app.components.admin.PostManager.PostPreview.deleteIdeaConfirmation',
    defaultMessage: 'Are you sure you want to delete this idea?',
  },
  deleteInitiativeConfirmation: {
    id:
      'app.components.admin.PostManager.PostPreview.deleteInitiativeConfirmation',
    defaultMessage: 'Are you sure you want to delete this initiative?',
  },
  voteCounts: {
    id: 'app.components.admin.PostManager.PostPreview.voteCounts',
    defaultMessage: 'Vote counts:',
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
  basketsCountTooltip: {
    id: 'app.components.admin.PostManager.PostPreview.basketsCountTooltip',
    defaultMessage:
      'The number of users that added this idea to their participatory budget',
  },
  cancelEdit: {
    id: 'app.components.admin.PostManager.PostPreview.cancelEdit',
    defaultMessage: 'Cancel edit',
  },
  noOne: {
    id: 'app.components.admin.PostManager.PostPreview.noOne',
    defaultMessage: 'Unassigned',
  },
  formTitle: {
    id: 'app.components.admin.PostManager.PostPreview.formTitle',
    defaultMessage: 'Editing idea',
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
    id: 'app.containers.IdeasShow.postedIn',
    defaultMessage: 'Posted in {projectLink}',
  },
  xDaysLeft: {
    id: 'app.containers.IdeasShow.xDaysLeft',
    defaultMessage:
      '{x, plural, =0 {Less than a day} one {One day} other {# days}} left',
  },
  proposedBudgetTitle: {
    id: 'app.containers.IdeasShow.proposedBudgetTitle',
    defaultMessage: 'Proposed budget',
  },
  bodyTitle: {
    id: 'app.containers.IdeasShow.bodyTitle',
    defaultMessage: 'Description',
  },
});
