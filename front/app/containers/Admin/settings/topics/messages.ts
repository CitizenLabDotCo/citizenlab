import { defineMessages } from 'react-intl';

export default defineMessages({
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
  projectsSettings: {
    id: 'app.containers.AdminPage.SettingsPage.projectsSettings',
    defaultMessage: 'project settings',
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
