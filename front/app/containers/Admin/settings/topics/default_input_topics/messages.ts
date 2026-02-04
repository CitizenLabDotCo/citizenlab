import { defineMessages } from 'react-intl';

export default defineMessages({
  descriptionDefaultInputTopicManagerText: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.DefaultInputTopics.descriptionDefaultInputTopicManagerText',
    defaultMessage:
      'Input tags are used to categorize inputs within projects, typically chosen by the author. The inputs tags available to authors can be configured per project. Here you can configure the defaults for new projects. Changes to these defaults will not affect existing projects.',
  },
  addDefaultInputTopicButton: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.DefaultInputTopics.addDefaultInputTopicButton',
    defaultMessage: 'Add default input tag',
  },
  addSubtopicButton: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.DefaultInputTopics.addSubtopicButton',
    defaultMessage: 'Add subtag',
  },
  editDefaultInputTopicFormTitle: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.DefaultInputTopics.editDefaultInputTopicFormTitle',
    defaultMessage: 'Edit default input tag',
  },
  confirmHeader: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.DefaultInputTopics.confirmHeader',
    defaultMessage: 'Are you sure you want to delete this default input tag?',
  },
  deleteDefaultInputTopicConfirmation: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.DefaultInputTopics.deleteDefaultInputTopicConfirmation',
    defaultMessage:
      'This will delete this default input tag. Projects that already use this tag will keep their copy.',
  },
  deleteDefaultInputTopicWithChildrenConfirmation: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.DefaultInputTopics.deleteDefaultInputTopicWithChildrenConfirmation',
    defaultMessage:
      'This tag has subtags. Deleting it will also delete all its subtags. Projects that already use these tags will keep their copies.',
  },
  cancel: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.DefaultInputTopics.cancel',
    defaultMessage: 'Cancel',
  },
  deleteButtonLabel: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.DefaultInputTopics.deleteButtonLabel',
    defaultMessage: 'Delete',
  },
  editButtonLabel: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.DefaultInputTopics.editButtonLabel',
    defaultMessage: 'Edit',
  },
  fieldTopicTitle: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.DefaultInputTopics.fieldTopicTitle',
    defaultMessage: 'Tag name',
  },
  fieldTopicTitleError: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.DefaultInputTopics.fieldTopicTitleError',
    defaultMessage: 'Provide a tag name for all languages',
  },
  fieldTopicDescription: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.DefaultInputTopics.fieldTopicDescription',
    defaultMessage: 'Tag description',
  },
  fieldTopicDescriptionTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.DefaultInputTopics.fieldTopicDescriptionTooltip',
    defaultMessage:
      'Add an optional description to provide more context about this tag.',
  },
  fieldTopicSave: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.DefaultInputTopics.fieldTopicSave',
    defaultMessage: 'Save tag',
  },
});
