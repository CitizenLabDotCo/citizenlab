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
    defaultMessage:
      'The name you choose for each topic will be visible for citizens during signup and when filtering projects.',
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
});
