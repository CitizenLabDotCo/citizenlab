import { defineMessages } from 'react-intl';

export default defineMessages({
  tabPlatformTags: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.tabPlatformTags',
    defaultMessage: 'Platform tags',
  },
  tabDefaultInputTags: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.tabDefaultInputTags',
    defaultMessage: 'Default input tags',
  },
  descriptionTopicManagerText: {
    id: 'app.containers.AdminPage.SettingsPage.descriptionTopicManagerText',
    defaultMessage:
      'Topics can be added to help categorise inputs. Here you can add and delete topics that you would like to use on your platform. You can add the topics to specific projects in the {adminProjectsLink}.',
  },
  titleTopicManager: {
    id: 'app.containers.AdminPage.SettingsPage.titleTopicManager',
    defaultMessage: 'Topic manager',
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
    defaultMessage:
      'The name you choose for each topic will be visible for citizens during signup and when filtering projects.',
  },
  fieldTopicTitleError: {
    id: 'app.containers.AdminPage.SettingsPage.fieldTopicTitleError',
    defaultMessage: 'Provide a tag name for all languages',
  },
  fieldTopicDescription: {
    id: 'app.containers.AdminPage.SettingsPage.fieldTopicDescription',
    defaultMessage: 'Tag description',
  },
  fieldTopicDescriptionTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.fieldTopicDescriptionTooltip',
    defaultMessage:
      'Add an optional description to provide more context about this tag.',
  },
  fieldTopicSave: {
    id: 'app.containers.AdminPage.SettingsPage.fieldTopicSave',
    defaultMessage: 'Save tag',
  },
  editTopicFormTitle: {
    id: 'app.containers.AdminPage.SettingsPage.editTopicFormTitle',
    defaultMessage: 'Edit topic',
  },
  confirmHeader: {
    id: 'app.containers.AdminPage.SettingsPage.confirmHeader',
    defaultMessage: 'Are you sure you want to delete this topic?',
  },
  deleteTopicConfirmation: {
    id: 'app.containers.AdminPage.SettingsPage.deleteTopicConfirmation',
    defaultMessage:
      'This will delete the topic, including from all existing inputs. This change will apply to all projects.',
  },
  cancel: {
    id: 'app.containers.AdminPage.SettingsPage.cancel',
    defaultMessage: 'Cancel',
  },
  delete: {
    id: 'app.containers.AdminPage.SettingsPage.delete',
    defaultMessage: 'Delete',
  },
  deleteButtonLabel: {
    id: 'app.containers.AdminPage.SettingsPage.deleteTopicButtonLabel',
    defaultMessage: 'Delete',
  },
  editButtonLabel: {
    id: 'app.containers.AdminPage.SettingsPage.editTopicButtonLabel',
    defaultMessage: 'Edit',
  },
  projectsSettings: {
    id: 'app.containers.AdminPage.SettingsPage.projectsSettings',
    defaultMessage: 'project settings',
  },
  // Default Input Topics messages
  titleDefaultInputTopicManager: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.titleDefaultInputTopicManager',
    defaultMessage: 'Default input tag manager',
  },
  descriptionDefaultInputTopicManagerText: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.descriptionDefaultInputTopicManagerText',
    defaultMessage:
      'Default input tags are automatically added to new projects. Citizens can use these tags to categorize their inputs. You can customize tags for each project in the project settings.',
  },
  addDefaultInputTopicButton: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.addDefaultInputTopicButton',
    defaultMessage: 'Add default input tag',
  },
  editDefaultInputTopicFormTitle: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.editDefaultInputTopicFormTitle',
    defaultMessage: 'Edit default input tag',
  },
  deleteDefaultInputTopicConfirmation: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.deleteDefaultInputTopicConfirmation',
    defaultMessage:
      'This will delete this default input tag. Projects that already use this tag will keep their copy.',
  },
  fieldTopicDefault: {
    id: 'app.containers.AdminPage.SettingsPage.fieldTopicDefault',
    defaultMessage: 'Add to new projects by default',
  },
  fieldTopicDefaultTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.fieldTopicDefaultTooltip',
    defaultMessage:
      'When enabled, this topic will be automatically added to all newly created projects.',
  },
});
