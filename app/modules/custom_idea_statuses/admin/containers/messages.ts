import { defineMessages } from 'react-intl';

export default defineMessages({
  // required: {
  //   id: 'app.containers.admin.ideaStatuses.all.required',
  //   defaultMessage: 'Required',
  // },
  deleteButtonLabel: {
    id: 'app.containers.admin.ideaStatuses.all.deleteButtonLabel',
    defaultMessage: 'Delete',
  },
  editButtonLabel: {
    id: 'app.containers.admin.ideaStatuses.all.editButtonLabel',
    defaultMessage: 'Edit',
  },
  // systemField: {
  //   id: 'app.containers.admin.ideaStatuses.all.systemField',
  //   defaultMessage: 'Default',
  // },
  addIdeaStatus: {
    id: 'app.containers.admin.ideaStatuses.all.addIdeaStatus',
    defaultMessage: 'Add status',
  },
  // editIdeaStatus: {
  //   id: 'app.containers.admin.ideaStatuses.all.editIdeaStatus',
  //   defaultMessage: 'Edit status',
  // },
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
  // fieldTitle: {
  //   id: 'app.containers.admin.ideaStatuses.form.fieldTitle',
  //   defaultMessage: 'Status Name',
  // },
  // fieldDescription: {
  //   id: 'app.containers.admin.ideaStatuses.form.fieldDescription',
  //   defaultMessage: 'Status Description',
  // },
  // fieldColor: {
  //   id: 'app.containers.admin.ideaStatuses.form.fieldColor',
  //   defaultMessage: 'Color',
  // },
  // category: {
  //   id: 'app.containers.admin.ideaStatuses.form.category',
  //   defaultMessage: 'Category',
  // },
  // categoryDescription: {
  //   id: 'app.containers.admin.ideaStatuses.form.categoryDescription',
  //   defaultMessage:
  //     'Please select the category that best represents your status. This selection will help our analytics tool to more accurately process and analyze posts.',
  // },
  // proposedFieldCodeTitle: {
  //   id: 'app.containers.admin.ideaStatuses.form.proposedFieldCodeTitle',
  //   defaultMessage: 'Proposed',
  // },
  // viewedFieldCodeTitle: {
  //   id: 'app.containers.admin.ideaStatuses.form.viewedFieldCodeTitle',
  //   defaultMessage: 'Viewed',
  // },
  // under_considerationFieldCodeTitle: {
  //   id:
  //     'app.containers.admin.ideaStatuses.form.under_considerationFieldCodeTitle',
  //   defaultMessage: 'Under Consideration',
  // },
  // acceptedFieldCodeTitle: {
  //   id: 'app.containers.admin.ideaStatuses.form.acceptedFieldCodeTitle',
  //   defaultMessage: 'Approved',
  // },
  // implementedFieldCodeTitle: {
  //   id: 'app.containers.admin.ideaStatuses.form.implementedFieldCodeTitle',
  //   defaultMessage: 'Implemented',
  // },
  // rejectedFieldCodeTitle: {
  //   id: 'app.containers.admin.ideaStatuses.form.rejectedFieldCodeTitle',
  //   defaultMessage: 'Not Selected',
  // },
  // customFieldCodeTitle: {
  //   id: 'app.containers.admin.ideaStatuses.form.customFieldCodeTitle',
  //   defaultMessage: 'Other',
  // },
  // proposedFieldCodeDescription: {
  //   id: 'app.containers.admin.ideaStatuses.form.proposedFieldCodeDescription',
  //   defaultMessage: 'Successfully submitted as a proposal for consideration',
  // },
  // viewedFieldCodeDescription: {
  //   id: 'app.containers.admin.ideaStatuses.form.viewedFieldCodeDescription',
  //   defaultMessage: 'Viewed but not yet processed',
  // },
  // under_considerationFieldCodeDescription: {
  //   id:
  //     'app.containers.admin.ideaStatuses.form.under_considerationFieldCodeDescription',
  //   defaultMessage: 'Considered for implementation or next steps',
  // },
  // acceptedFieldCodeDescription: {
  //   id: 'app.containers.admin.ideaStatuses.form.acceptedFieldCodeDescription',
  //   defaultMessage: 'Selected for implementation or next steps',
  // },
  // implementedFieldCodeDescription: {
  //   id:
  //     'app.containers.admin.ideaStatuses.form.implementedFieldCodeDescription',
  //   defaultMessage: 'Successfully implemented',
  // },
  // rejectedFieldCodeDescription: {
  //   id: 'app.containers.admin.ideaStatuses.form.rejectedFieldCodeDescription',
  //   defaultMessage: 'Ineligible or not selected to move forward',
  // },
});
