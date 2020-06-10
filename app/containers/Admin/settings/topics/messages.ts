import { defineMessages } from 'react-intl';

export default defineMessages({
  topicManagerDescription: {
    id: 'app.containers.AdminPage.SettingsPage.topicManagerDescription',
    defaultMessage: 'Topics are selected by users to categorize their ideas. Here you can add and delete the topics available on your platform. Go to the {adminProjectsLink} to manage the available topics for each project.'
  },
  titleTopicManager: {
    id: 'app.containers.AdminPage.SettingsPage.titleTopicManager',
    defaultMessage: 'Topic manager',
  },
  deleteButtonLabel: {
    id: 'app.containers.AdminPage.SettingsPage.deleteTopicButtonLabel',
    defaultMessage: 'Delete',
  },
  editButtonLabel: {
    id: 'app.containers.AdminPage.SettingsPage.editTopicButtonLabel',
    defaultMessage: 'Edit',
  },
  addTopicButton: {
    id: 'app.containers.AdminPage.SettingsPage.addTopicButton',
    defaultMessage: 'Add topic',
  },
  fieldTopicTitle: {
    id: 'app.containers.AdminPage.SettingsPage.fieldTopicTitle',
    defaultMessage: 'Topic name',
  },
  fieldTopicTitleTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.fieldTopicTitleTooltip',
    defaultMessage: 'The name you choose for each topic will be visible for citizens during signup and when filtering projects.',
  },
  editTopicFormTitle: {
    id: 'app.containers.AdminPage.SettingsPage.editTopicFormTitle',
    defaultMessage: 'Edit topic',
  },
  defaultTopic: {
    id: 'app.containers.AdminPage.SettingsPage.defaultTopic',
    defaultMessage: 'Default topic',
  },
  confirmHeader: {
    id: 'app.containers.AdminPage.SettingsPage.confirmHeader',
    defaultMessage: 'Do you want to remove this topic?'
  },
  topicDeletionConfirmationMessage: {
    id: 'app.containers.AdminPage.SettingsPage.topicDeletionConfirmationMessage',
     defaultMessage: 'Are you sure you want to delete this topic? This will also remove all existing references to that topic for ideas. This change will apply to all of your projects.',
  },
  cancel: {
    id: 'app.containers.AdminPage.SettingsPage.cancel',
    defaultMessage: 'Cancel'
  },
  delete: {
    id: 'app.containers.AdminPage.SettingsPage.delete',
    defaultMessage: 'Delete'
  },
  projectsSettings: {
    id: 'app.containers.AdminPage.SettingsPage.projectsSettings',
    defaultMessage: 'project settings'
  }
});
