import { defineMessages } from 'react-intl';

export default defineMessages({
  metaTitle: {
    id: 'app.containers.Admin.initiatives.metaTitle',
    defaultMessage: 'Admin initiatives page',
  },
  metaDescription: {
    id: 'app.containers.Admin.initiatives.metaDescription',
    defaultMessage: 'Manage initiatives on your platform'
  },
  titleInitiatives: {
    id: 'app.containers.Admin.initiatives.titleInitiatives',
    defaultMessage: 'Initiatives'
  },
  tabSettings: {
    id: 'app.containers.Admin.initiatives.tabSettings',
    defaultMessage: 'Settings'
  },
  tabManage: {
    id: 'app.containers.Admin.initiatives.tabManage',
    defaultMessage: 'Manage'
  },
  titleSettingsTab: {
    id: 'app.containers.Admin.initiatives.titleSettingsTab',
    defaultMessage: 'Define how initiatives should work in your context.'
  },
  subtitleSettingsTab: {
    id: 'app.containers.Admin.initiatives.subtitleSettingsTab',
    defaultMessage: 'Be careful as you change these settings, they will apply to all active initiatives.'
  },
  fieldVotingTreshold: {
    id: 'app.containers.Admin.initiatives.fieldVotingTreshold',
    defaultMessage: 'Voting threshold'
  },
  fieldDaysLimit: {
    id: 'app.containers.Admin.initiatives.fieldDaysLimit',
    defaultMessage: 'Days to reach treshold'
  },
  fieldTresholdReachedMessage: {
    id: 'app.containers.Admin.initiatives.fieldTresholdReachedMessage',
    defaultMessage: 'When treshold is reached'
  },
  fieldTresholdReachedMessageInfo: {
    id: 'app.containers.Admin.initiatives.fieldTresholdReachedMessageInfo',
    defaultMessage: 'This will be shown to all users on the initiatives page.'
  },
  fieldEligibilityCriteria: {
    id: 'app.containers.Admin.initiatives.fieldEligibilityCriteria',
    defaultMessage: 'The initiative should'
  },
  fieldEligibilityCriteriaInfo: {
    id: 'app.containers.Admin.initiatives.fieldEligibilityCriteriaInfo',
    defaultMessage: 'This will be shown to users posting an initiative. These criteria are the rules on which you will let an initiative be considered.'
  },
});
