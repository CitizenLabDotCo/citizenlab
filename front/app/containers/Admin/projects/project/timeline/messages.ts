import { defineMessages } from 'react-intl';

export default defineMessages({
  editPhaseTitle: {
    id: 'app.containers.AdminPage.ProjectTimeline.editPhaseTitle',
    defaultMessage: 'Edit Phase',
  },
  newPhaseTitle: {
    id: 'app.containers.AdminPage.ProjectTimeline.newPhaseTitle',
    defaultMessage: 'New Phase',
  },
  titleLabel: {
    id: 'app.containers.AdminPage.ProjectTimeline.titleLabel',
    defaultMessage: 'Title',
  },
  descriptionLabel: {
    id: 'app.containers.AdminPage.ProjectTimeline.descriptionLabel',
    defaultMessage: 'Description',
  },
  datesLabel: {
    id: 'app.containers.AdminPage.ProjectTimeline.datesLabel',
    defaultMessage: 'Dates',
  },
  saveLabel: {
    id: 'app.containers.AdminPage.ProjectTimeline.saveLabel',
    defaultMessage: 'Save',
  },
  saveSuccessLabel: {
    id: 'app.containers.AdminPage.ProjectTimeline.saveSuccessLabel',
    defaultMessage: 'Success',
  },
  saveErrorMessage: {
    id: 'app.containers.AdminPage.ProjectTimeline.saveErrorMessage',
    defaultMessage: 'There was an error submitting the form, please try again.',
  },
  saveSuccessMessage: {
    id: 'app.containers.AdminPage.ProjectTimeline.saveSuccessMessage',
    defaultMessage: 'Your changes have been saved successfully.',
  },
  orderColumnTitle: {
    id: 'app.containers.AdminPage.ProjectTimeline.orderColumnTitle',
    defaultMessage: 'Order',
  },
  nameColumnTitle: {
    id: 'app.containers.AdminPage.ProjectTimeline.nameColumnTitle',
    defaultMessage: 'Name & Dates',
  },
  addPhaseButton: {
    id: 'app.containers.AdminPage.ProjectTimeline.addPhaseButton',
    defaultMessage: 'Add a phase',
  },
  editPhaseButton: {
    id: 'app.containers.AdminPage.ProjectTimeline.editPhaseButton',
    defaultMessage: 'Edit',
  },
  deletePhaseButton: {
    id: 'app.containers.AdminPage.ProjectTimeline.deletePhaseButton',
    defaultMessage: 'Delete',
  },
  deletePhaseConfirmation: {
    id: 'app.containers.AdminPage.ProjectTimeline.deletePhaseConfirmation',
    defaultMessage: 'Are you sure you wannna delete this phase?',
  },
  startDatePlaceholder: {
    id: 'app.containers.AdminPage.ProjectTimeline.startDatePlaceholder',
    defaultMessage: 'Start Date',
  },
  endDatePlaceholder: {
    id: 'app.containers.AdminPage.ProjectTimeline.endDatePlaceholder',
    defaultMessage: 'End Date',
  },
  fileUploadLabel: {
    id: 'app.containers.AdminPage.ProjectTimeline.fileUploadLabel',
    defaultMessage: 'Attach files to this phase',
  },
  titleTimeline: {
    id: 'app.containers.AdminPage.ProjectTimeline.titleTimeline',
    defaultMessage: 'Manage timeline phases',
  },
  subtitleTimeline: {
    id: 'app.containers.AdminPage.ProjectTimeline.subtitleTimeline',
    defaultMessage:
      'Define the different timeline phases for your project and describe what each phase is about. In every phase you can pick a different participation method: idea gathering, surveys, information, reacting, commenting or participatory budgeting.',
  },
  deletePhaseConfirmationQuestion: {
    id: 'app.containers.AdminPage.ProjectTimeline.deletePhaseConfirmationQuestion',
    defaultMessage: 'Are you sure you want to delete this phase?',
  },
  deletePhaseInfo: {
    id: 'app.containers.AdminPage.ProjectTimeline.deletePhaseInfo',
    defaultMessage:
      'All data relating to this phase will be deleted. This cannot be undone.',
  },
  cancelDeletePhaseText: {
    id: 'app.containers.AdminPage.ProjectTimeline.cancelDeleteButtonText',
    defaultMessage: 'Cancel',
  },
  deletePhaseButtonText: {
    id: 'app.containers.AdminPage.ProjectTimeline.deletePhaseButtonText',
    defaultMessage: 'Yes, delete this phase',
  },
  uploadAttachments: {
    id: 'app.containers.AdminPage.ProjectTimeline.uploadAttachments',
    defaultMessage: 'Upload attachments',
  },
  automatedEmails: {
    id: 'app.containers.AdminPage.ProjectTimeline.automatedEmails',
    defaultMessage: 'Automated emails',
  },
  noEndDate: {
    id: 'app.containers.AdminPage.ProjectTimeline.noEndDate',
    defaultMessage: 'No end date',
  },
  noEndDateCheckbox: {
    id: 'app.containers.AdminPage.ProjectTimeline.noEndDateDescription',
    defaultMessage: "This phase doesn't have a predefined end date.",
  },
  noEndDateWarningTitle: {
    id: 'app.containers.AdminPage.ProjectTimeline.noEndDateWarningTitle',
    defaultMessage: 'Not selecting an end date for this implies that:',
  },
  noEndDateWarningBullet1: {
    id: 'app.containers.AdminPage.ProjectTimeline.noEndDateWarningBullet1',
    defaultMessage:
      "Some methods' results sharing (such as voting results) won't be triggered until an end date is selected.",
  },
  noEndDateWarningBullet2: {
    id: 'app.containers.AdminPage.ProjectTimeline.noEndDateWarningBullet2',
    defaultMessage:
      'As soon as you add a phase after this one, it will add an end date to this phase.',
  },
  endDate: {
    id: 'app.containers.AdminPage.ProjectTimeline.endDate',
    defaultMessage: 'End date',
  },
  startDate: {
    id: 'app.containers.AdminPage.ProjectTimeline.startDate',
    defaultMessage: 'Start date',
  },
  automatedEmailsDescription: {
    id: 'app.containers.AdminPage.ProjectTimeline.automatedEmailsDescription',
    defaultMessage: 'You can configure emails triggered on a phase level',
  },
  disabledProjectPhaseEmailMessage: {
    id: 'app.containers.AdminPage.ProjectTimeline.disabledProjectPhaseEmailMessage',
    defaultMessage:
      'This option is currently turned off for all projects on the {automatedEmailsLink} page. As a result, you will not be able to individually toggle this setting for this phase.',
  },
  automatedEmailsLinkText: {
    id: 'app.containers.Admin.PagesAndMenu.containers.ProjectsList.automatedEmailsLinkText',
    defaultMessage: 'automated emails',
  },
  emptyDescriptionWarning: {
    id: 'app.containers.Admin.PagesAndMenu.containers.ProjectsList.emptyDescriptionWarning1',
    defaultMessage:
      'For single phase projects, if the end date is empty and the description is not filled in, a timeline will not be displayed on the project page.',
  },
});
