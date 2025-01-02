import { defineMessages } from 'react-intl';

export default defineMessages({
  addIdeaStatus: {
    id: 'app.containers.admin.ideaStatuses.all.addIdeaStatus',
    defaultMessage: 'Add status',
  },
  editIdeaStatus: {
    id: 'app.containers.admin.ideaStatuses.all.editIdeaStatus',
    defaultMessage: 'Edit status',
  },
  titleIdeaStatuses1: {
    id: 'app.containers.admin.ideaStatuses.all.titleIdeaStatuses1',
    defaultMessage: 'Edit input statuses',
  },
  titleProposalStatuses: {
    id: 'app.containers.admin.ideaStatuses.all.titleProposalStatuses',
    defaultMessage: 'Edit proposal statuses',
  },
  subtitleInputStatuses1: {
    id: 'app.containers.admin.ideaStatuses.all.subtitleInputStatuses1',
    defaultMessage:
      'Manage the status that can be assigned to participant input within a project. The status is publicly visible and helps in keeping participants informed.',
  },
  subtitleProposalStatuses: {
    id: 'app.containers.admin.ideaStatuses.all.subtitleProposalStatuses',
    defaultMessage:
      'Manage the status that can be assigned to proposals within a project. The status is publicly visible and helps in keeping participants informed.',
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
  defaultStatusDeleteButtonTooltip1: {
    id: 'app.containers.admin.ideaStatuses.all.defaultStatusDeleteButtonTooltip1',
    defaultMessage: 'Default statuses can not be deleted.',
  },
  lockedStatusTooltip: {
    id: 'app.containers.admin.ideaStatuses.all.lockedStatusTooltip',
    defaultMessage: 'This status cannot be deleted or moved.',
  },
  pricingPlanUpgrade: {
    id: 'app.containers.admin.ideaStatuses.all.pricingPlanUpgrade',
    defaultMessage:
      'Configuring custom input statuses is not included in your current plan. Talk to your Government Success Manager or admin to unlock it.',
  },
});
