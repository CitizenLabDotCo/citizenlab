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
  surveyTitleLabel: {
    id: 'app.containers.AdminPage.ProjectTimeline.surveyTitleLabel',
    defaultMessage: 'Survey title',
  },
  surveyCTALabel: {
    id: 'app.containers.AdminPage.ProjectTimeline.surveyCTALabel',
    defaultMessage: 'Button',
  },
  previewSurveyCTALabel: {
    id: 'app.containers.AdminPage.ProjectTimeline.previewSurveyCTALabel',
    defaultMessage: 'Preview',
  },
  defaultSurveyTitleLabel: {
    id: 'app.containers.AdminPage.ProjectTimeline.defaultSurveyTitleLabel',
    defaultMessage: 'Survey',
  },
  defaultSurveyCTALabel: {
    id: 'app.containers.AdminPage.ProjectTimeline.defaultSurveyCTALabel',
    defaultMessage: 'Take the survey',
  },
  descriptionLabel: {
    id: 'app.containers.AdminPage.ProjectTimeline.descriptionLabel',
    defaultMessage: 'Description',
  },
  datesLabel: {
    id: 'app.containers.AdminPage.ProjectTimeline.datesLabel',
    defaultMessage: 'Dates',
  },
  saveChangesLabel: {
    id: 'app.containers.AdminPage.ProjectTimeline.saveChangesLabel',
    defaultMessage: 'Save changes',
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
  uploadAttachments: {
    id: 'app.containers.AdminPage.ProjectTimeline.uploadAttachments',
    defaultMessage: 'Upload attachments',
  },
  automatedEmails: {
    id: 'app.containers.AdminPage.ProjectTimeline.automatedEmails',
    defaultMessage: 'Automated emails',
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
