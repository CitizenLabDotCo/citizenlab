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
  newSurveyTitle: {
    id: 'app.containers.AdminPage.ProjectTimeline.newSurveyTitle',
    defaultMessage: 'New survey',
  },
  titleLabel: {
    id: 'app.containers.AdminPage.ProjectTimeline.titleLabel',
    defaultMessage: 'Title',
  },
  phaseTitlePlaceholder: {
    id: 'app.containers.AdminPage.ProjectTimeline.phaseTitlePlaceholder',
    defaultMessage: 'New phase',
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
  allowMultipleResponsesLabel: {
    id: 'app.containers.AdminPage.ProjectTimeline.allowMultipleResponsesLabel',
    defaultMessage: 'Allow multiple responses',
  },
  allowMultipleResponsesDescription: {
    id: 'app.containers.AdminPage.ProjectTimeline.allowMultipleResponsesDescription',
    defaultMessage:
      'When enabled, a participant can submit this survey more than once. When disabled, each participant can only respond once.',
  },
  defaultSurveyTitleLabel: {
    id: 'app.containers.AdminPage.ProjectTimeline.defaultSurveyTitleLabel',
    defaultMessage: 'Survey',
  },
  defaultSurveyCTALabel: {
    id: 'app.containers.AdminPage.ProjectTimeline.defaultSurveyCTALabel',
    defaultMessage: 'Take the survey',
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
  placementLabel: {
    id: 'app.containers.AdminPage.ProjectTimeline.placementLabel',
    defaultMessage: 'Placement',
  },
  placementOnTimelineDescription: {
    id: 'app.containers.AdminPage.ProjectTimeline.placementOnTimelineDescription',
    defaultMessage:
      'This survey is a phase on the project timeline. It runs in sequence with the other phases.',
  },
  placementStandaloneDescription: {
    id: 'app.containers.AdminPage.ProjectTimeline.placementStandaloneDescription',
    defaultMessage:
      'This survey runs alongside the timeline as an extra survey. It can overlap other phases.',
  },
  moveOffTimelineButton: {
    id: 'app.containers.AdminPage.ProjectTimeline.moveOffTimelineButton',
    defaultMessage: 'Make it an extra survey',
  },
  moveOnTimelineButton: {
    id: 'app.containers.AdminPage.ProjectTimeline.moveOnTimelineButton',
    defaultMessage: 'Move onto the timeline',
  },
  moveOffTimelineModalTitle: {
    id: 'app.containers.AdminPage.ProjectTimeline.moveOffTimelineModalTitle',
    defaultMessage: 'Make this an extra survey?',
  },
  moveOnTimelineModalTitle: {
    id: 'app.containers.AdminPage.ProjectTimeline.moveOnTimelineModalTitle',
    defaultMessage: 'Move this survey onto the timeline?',
  },
  moveOffTimelineExplanation: {
    id: 'app.containers.AdminPage.ProjectTimeline.moveOffTimelineExplanation',
    defaultMessage:
      'The survey will no longer be a phase on the timeline. It keeps its questions and its responses.',
  },
  moveOnTimelineExplanation: {
    id: 'app.containers.AdminPage.ProjectTimeline.moveOnTimelineExplanation',
    defaultMessage:
      'The survey will become a phase on the timeline. It keeps its questions and its responses.',
  },
  moveWarningVisibility: {
    id: 'app.containers.AdminPage.ProjectTimeline.moveWarningVisibility',
    defaultMessage:
      'Residents will find the survey in a different place on the project page, so any link you shared to it may no longer work.',
  },
  moveWarningWidgetRemoved: {
    id: 'app.containers.AdminPage.ProjectTimeline.moveWarningWidgetRemoved',
    defaultMessage:
      'The survey is shown in a block on your project page. That block will be removed.',
  },
  moveWarningTimelineOverlap: {
    id: 'app.containers.AdminPage.ProjectTimeline.moveWarningTimelineOverlap',
    defaultMessage:
      "Timeline phases cannot overlap. If this survey's dates overlap another phase, the move is refused.",
  },
  moveWarningPreviousPhaseEnds: {
    id: 'app.containers.AdminPage.ProjectTimeline.moveWarningPreviousPhaseEnds',
    defaultMessage:
      '"{phaseName}" has no end date. It will end on {date}, when this survey starts.',
  },
  moveConfirmButton: {
    id: 'app.containers.AdminPage.ProjectTimeline.moveConfirmButton',
    defaultMessage: 'Move the survey',
  },
  moveCancelButton: {
    id: 'app.containers.AdminPage.ProjectTimeline.moveCancelButton',
    defaultMessage: 'Cancel',
  },
  moveSaveChangesFirst: {
    id: 'app.containers.AdminPage.ProjectTimeline.moveSaveChangesFirst',
    defaultMessage: 'Save your changes before you move the survey.',
  },
  movePreviousPhaseError: {
    id: 'app.containers.AdminPage.ProjectTimeline.movePreviousPhaseError',
    defaultMessage:
      'The phase before this survey has no end date, and it cannot end on the start date of this survey. Change the dates and try again.',
  },
});
