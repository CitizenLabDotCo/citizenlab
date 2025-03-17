import { defineMessages } from 'react-intl';

export default defineMessages({
  popup: {
    id: 'app.containers.Admin.communityMonitor.settings.popup',
    defaultMessage: 'Popup',
  },
  preview: {
    id: 'app.containers.Admin.communityMonitor.settings.preview',
    defaultMessage: 'Preview',
  },
  popupDescription: {
    id: 'app.containers.Admin.communityMonitor.settings.popupDescription2',
    defaultMessage:
      'A popup is periodically displayed to residents encouraging them to complete the Community Monitor Survey. You can adjust the frequency which determines the percentage of residents who will randomly see the popup when the conditions outlined below are met.',
  },
  defaultFrequency: {
    id: 'app.containers.Admin.communityMonitor.settings.defaultFrequency2',
    defaultMessage: 'The default frequency value is 100%.',
  },
  whatConditionsPopup: {
    id: 'app.containers.Admin.communityMonitor.settings.whatConditionsPopup',
    defaultMessage: 'Under what conditions can the popup appear for residents?',
  },
  acceptingSubmissions: {
    id: 'app.containers.Admin.communityMonitor.settings.acceptingSubmissions',
    defaultMessage: 'Community Monitor Survey is accepting submissions.',
  },
  residentNotSeenPopup: {
    id: 'app.containers.Admin.communityMonitor.settings.residentNotSeenPopup',
    defaultMessage:
      'Resident has not already seen the popup in the previous 3 months.',
  },
  residentHasFilledOutSurvey: {
    id: 'app.containers.Admin.communityMonitor.settings.residentHasFilledOutSurvey',
    defaultMessage:
      ' Resident has not already filled out the survey in the previous 3 months.',
  },
  uponLoadingPage: {
    id: 'app.containers.Admin.communityMonitor.settings.uponLoadingPage',
    defaultMessage: 'Upon loading the Homepage or a Custom Page.',
  },
  afterResidentAction: {
    id: 'app.containers.Admin.communityMonitor.settings.afterResidentAction',
    defaultMessage:
      ' After a resident registers an event attendance, submits a vote, or returns to a project page after submitting a survey.',
  },
  frequencyInputLabel: {
    id: 'app.containers.Admin.communityMonitor.settings.frequencyInputLabel2',
    defaultMessage: 'Popup frequency (0 to 100)',
  },
  save: {
    id: 'app.containers.Admin.communityMonitor.settings.save',
    defaultMessage: 'Save',
  },
  saved: {
    id: 'app.containers.Admin.communityMonitor.settings.saved',
    defaultMessage: 'Saved',
  },
});
