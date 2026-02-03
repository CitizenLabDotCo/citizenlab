import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.containers.AdminPage.Topics.inputTags',
    defaultMessage: 'Input tags',
  },
  projectTopicsDescription: {
    id: 'app.containers.AdminPage.Topics.projectTopicsDescription2',
    defaultMessage:
      'Create and manage the tags that citizens can use to categorize their inputs in this project.',
  },
  defaultInputTopicsInfo: {
    id: 'app.containers.AdminPage.Topics.defaultInputTopicsInfo',
    defaultMessage:
      'Default tags for new projects can be configured in the {settingsLink}.',
  },
  defaultInputTopicsSettings: {
    id: 'app.containers.AdminPage.Topics.defaultInputTopicsSettings',
    defaultMessage: 'platform settings',
  },
  addInputTopic: {
    id: 'app.containers.AdminPage.Topics.addInputTopic',
    defaultMessage: 'Add input tag',
  },
  addSubtopic: {
    id: 'app.containers.AdminPage.Topics.addSubtopic',
    defaultMessage: 'Add subtag',
  },
  editInputTopic: {
    id: 'app.containers.AdminPage.Topics.editInputTopic',
    defaultMessage: 'Edit input tag',
  },
  edit: {
    id: 'app.containers.AdminPage.Topics.edit',
    defaultMessage: 'Edit',
  },
  delete: {
    id: 'app.containers.AdminPage.Topics.delete',
    defaultMessage: 'Delete',
  },
  cancel: {
    id: 'app.containers.AdminPage.Topics.cancel',
    defaultMessage: 'Cancel',
  },
  save: {
    id: 'app.containers.AdminPage.Topics.save',
    defaultMessage: 'Save',
  },
  confirmHeader: {
    id: 'app.containers.AdminPage.Topics.confirmHeader2',
    defaultMessage: 'Are you sure you want to delete this input tag?',
  },
  deleteInputTopicConfirmation: {
    id: 'app.containers.AdminPage.Topics.deleteInputTopicConfirmation',
    defaultMessage:
      'This tag will be removed from all inputs in this project. This action cannot be undone.',
  },
  deleteInputTopicWithChildrenConfirmation: {
    id: 'app.containers.AdminPage.Topics.deleteInputTopicWithChildrenConfirmation',
    defaultMessage:
      'This tag has subtags. Deleting it will also delete all its subtags. Inputs assigned to these tags will be updated. This action cannot be undone.',
  },
  lastTopicWarning: {
    id: 'app.containers.AdminPage.Topics.lastTopicWarning3',
    defaultMessage:
      "At least one tag is required. If you do not wish to use tags, the Tags item can be deleted from any phase's input form (if present).",
  },
  fieldTopicTitle: {
    id: 'app.containers.AdminPage.Topics.fieldTopicTitle',
    defaultMessage: 'Tag name',
  },
  fieldTopicTitleError: {
    id: 'app.containers.AdminPage.Topics.fieldTopicTitleError',
    defaultMessage: 'Provide a tag name for all languages',
  },
  fieldTopicDescription: {
    id: 'app.containers.AdminPage.Topics.fieldTopicDescription',
    defaultMessage: 'Tag description (optional)',
  },
  fieldTopicEmoji: {
    id: 'app.containers.AdminPage.Topics.fieldTopicEmoji',
    defaultMessage: 'Emoji (optional)',
  },
});
