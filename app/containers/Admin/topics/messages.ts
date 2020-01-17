import { defineMessages } from 'react-intl';

export default defineMessages({
  subtitleTopics: {
    id: 'app.containers.AdminPage.SettingsPage.subtitleTopics',
    defaultMessage: 'You can add, delete, rename and reorder your favorite topics here. Keep in mind that the current topics might be linked to existing content before renaming/removing topics to avoid loss of information.',
  },
  titleTopics: {
    id: 'app.containers.AdminPage.SettingsPage.titleTopics',
    defaultMessage: 'Topics configuration',
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
  editFormSubtitle: {
    id: 'app.containers.AdminPage.SettingsPage.editTopicFormSubtitle',
    defaultMessage: 'Keep in mind that this will also affect the topic name in ideas and initiatives currently referencing to this.',
  },
});
