import { defineMessages } from 'react-intl';

export default defineMessages({
  deleteButtonLabel: {
    id: 'app.containers.admin.ideaStatuses.all.deleteButtonLabel',
    defaultMessage: 'Delete',
  },
  editButtonLabel: {
    id: 'app.containers.admin.ideaStatuses.all.editButtonLabel',
    defaultMessage: 'Edit',
  },
  addIdeaStatus: {
    id: 'app.containers.admin.ideaStatuses.all.addIdeaStatus',
    defaultMessage: 'Add status',
  },
  editIdeaStatus: {
    id: 'app.containers.admin.ideaStatuses.all.editIdeaStatus',
    defaultMessage: 'Edit status',
  },
  titleIdeaStatuses: {
    id: 'app.containers.admin.ideaStatuses.all.titleIdeaStatuses',
    defaultMessage: 'Statuses',
  },
  subtitleInputStatuses: {
    id: 'app.containers.admin.ideaStatuses.all.subtitleInputStatuses',
    defaultMessage:
      "Here you can add, edit and delete the statuses that can be assigned to inputs. The status is publicly visible and helps participants know what's happening with their input. You can add a status to inputs in the {linkToManageTab} tab.",
  },
  manage: {
    id: 'app.containers.admin.ideaStatuses.all.manage',
    defaultMessage: 'Manage',
  },
  inputStatusDeleteButtonTooltip: {
    id: 'app.containers.admin.ideaStatuses.all.inputStatusDeleteButtonTooltip',
    defaultMessage:
      'Statuses currently assigned to an input cannot be deleted. You can remove/change the status from existing inputs in the {manageTab} tab.',
  },
  defaultStatusDeleteButtonTooltip: {
    id:
      'app.containers.admin.ideaStatuses.all.defaultStatusDeleteButtonTooltip',
    defaultMessage: 'The default status can not be deleted.',
  },
  lockedStatusTooltip: {
    id: 'app.containers.admin.ideaStatuses.all.lockedStatusTooltip',
    defaultMessage: 'This status cannot be deleted or moved.',
  },
});
