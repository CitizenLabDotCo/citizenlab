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
    id: 'app.containers.Admin.communityMonitor.settings.popupDescription3',
    defaultMessage:
      'A popup is periodically displayed to users encouraging them to complete the Community Monitor Survey. You can adjust the frequency which determines the percentage of users who will randomly see the popup when the conditions outlined below are met.',
  },
  defaultFrequency: {
    id: 'app.containers.Admin.communityMonitor.settings.defaultFrequency2',
    defaultMessage: 'The default frequency value is 100%.',
  },
  whatConditionsPopup: {
    id: 'app.containers.Admin.communityMonitor.settings.whatConditionsPopup2',
    defaultMessage: 'Under what conditions can the popup appear for users?',
  },
  acceptingSubmissions: {
    id: 'app.containers.Admin.communityMonitor.settings.acceptingSubmissions',
    defaultMessage: 'Community Monitor Survey is accepting submissions.',
  },
  residentNotSeenPopup: {
    id: 'app.containers.Admin.communityMonitor.settings.residentNotSeenPopup2',
    defaultMessage:
      'User has not already seen the popup in the previous 3 months.',
  },
  residentHasFilledOutSurvey: {
    id: 'app.containers.Admin.communityMonitor.settings.residentHasFilledOutSurvey2',
    defaultMessage:
      ' User has not already filled out the survey in the previous 3 months.',
  },
  uponLoadingPage: {
    id: 'app.containers.Admin.communityMonitor.settings.uponLoadingPage',
    defaultMessage: 'Upon loading the Homepage or a Custom Page.',
  },
  afterResidentAction: {
    id: 'app.containers.Admin.communityMonitor.settings.afterResidentAction2',
    defaultMessage:
      ' After a user registers an event attendance, submits a vote, or returns to a project page after submitting a survey.',
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
