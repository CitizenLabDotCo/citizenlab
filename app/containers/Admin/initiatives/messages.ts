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
  warningTresholdSettings: {
    id: 'app.containers.Admin.initiatives.warningTresholdSettings',
    defaultMessage: 'Changing this will impact all active initiatives'
  },
  fieldVotingThreshold: {
    id: 'app.containers.Admin.initiatives.fieldVotingThreshold',
    defaultMessage: 'Voting threshold'
  },
  fieldDaysLimit: {
    id: 'app.containers.Admin.initiatives.fieldDaysLimit',
    defaultMessage: 'Days to reach threshold'
  },
  fieldThresholdReachedMessage: {
    id: 'app.containers.Admin.initiatives.fieldThresholdReachedMessage',
    defaultMessage: 'What can people expect when their initiatives reach the threshold in time?'
  },
  fieldThresholdReachedMessageInfo: {
    id: 'app.containers.Admin.initiatives.fieldThresholdReachedMessageInfo',
    defaultMessage: 'This will be visible to all and shown with every initiative'
  },
  fieldEligibilityCriteria: {
    id: 'app.containers.Admin.initiatives.fieldEligibilityCriteria',
    defaultMessage: 'The criteria for an initiative'
  },
  fieldEligibilityCriteriaInfo: {
    id: 'app.containers.Admin.initiatives.fieldEligibilityCriteriaInfo',
    defaultMessage: 'This will be shown to users posting an initiative. These criteria define when an initiative can be eligible or not'
  },
});
