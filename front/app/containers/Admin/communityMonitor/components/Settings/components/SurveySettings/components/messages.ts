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
    id: 'app.containers.Admin.communityMonitor.settings.popupDescription',
    defaultMessage:
      'A popup is periodically shown to residents to encourage them to fill out the Community Monitor Survey. You can set the frequency of how often the popup is randomly shown to residents.',
  },
  defaultFrequency: {
    id: 'app.containers.Admin.communityMonitor.settings.defaultFrequency',
    defaultMessage: 'The default frequency value is 100% (1.0).',
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
    id: 'app.containers.Admin.communityMonitor.settings.frequencyInputLabel',
    defaultMessage: 'Popup frequency (0 to 1)',
  },
  save: {
    id: 'app.containers.Admin.communityMonitor.settings.save',
    defaultMessage: 'Save',
  },
});
