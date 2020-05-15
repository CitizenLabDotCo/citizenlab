import { defineMessages } from 'react-intl';

export default defineMessages({
  subtitleTopicManager: {
    id: 'app.containers.AdminPage.SettingsPage.subtitleTopicManager',
    defaultMessage: 'You can add and delete the topics that are available for ideation projects and proposals.',
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
  topicDeletionConfirmation: {
    id: 'app.containers.AdminPage.SettingsPage.topicDeletionConfirmation',
    defaultMessage: 'Are you sure you want to delete this topic? This will also remove all existing references to that topic for ideas and initiatives.',
  },
  fieldTitle: {
    id: 'app.containers.AdminPage.SettingsPage.fieldTopicTitle',
    defaultMessage: 'Topic name',
  },
  fieldTitleTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.fieldTopicTitleTooltip',
    defaultMessage: 'The name you choose for each topic will be visible for citizens during signup and when filtering projects.',
  },
  editFormTitle: {
    id: 'app.containers.AdminPage.SettingsPage.editTopicFormTitle',
    defaultMessage: 'Edit topic',
  },
});
