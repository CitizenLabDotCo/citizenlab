import { defineMessages } from 'react-intl';

export default defineMessages({
  descriptionTopicManagerText: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.GlobalTopics.descriptionTopicManagerText',
    defaultMessage:
      'Global topics are used to categorize projects, for example on the homepage. You can add the topics to specific projects in the {adminProjectsLink}.',
  },
  projectsSettings: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.GlobalTopics.projectsSettings',
    defaultMessage: 'project settings',
  },
  addTopicButton: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.GlobalTopics.addTopicButton',
    defaultMessage: 'Add topic',
  },
  editTopicFormTitle: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.GlobalTopics.editTopicFormTitle',
    defaultMessage: 'Edit topic',
  },
  confirmHeader: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.GlobalTopics.confirmHeader',
    defaultMessage: 'Are you sure you want to delete this topic?',
  },
  deleteTopicConfirmation: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.GlobalTopics.deleteTopicConfirmation',
    defaultMessage:
      'This will delete the topic, including from all existing projects.',
  },
  cancel: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.GlobalTopics.cancel',
    defaultMessage: 'Cancel',
  },
  deleteButtonLabel: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.GlobalTopics.deleteButtonLabel',
    defaultMessage: 'Delete',
  },
  editButtonLabel: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.GlobalTopics.editButtonLabel',
    defaultMessage: 'Edit',
  },
  fieldTopicTitle: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.GlobalTopics.fieldTopicTitle',
    defaultMessage: 'Topic name',
  },
  fieldTopicTitleTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.GlobalTopics.fieldTopicTitleTooltip',
    defaultMessage:
      'The name you choose for each topic will be visible for citizens during signup and when filtering projects.',
  },
  fieldTopicTitleError: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.GlobalTopics.fieldTopicTitleError',
    defaultMessage: 'Provide a tag name for all languages',
  },
  fieldTopicDescription: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.GlobalTopics.fieldTopicDescription',
    defaultMessage: 'Tag description',
  },
  fieldTopicDescriptionTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.GlobalTopics.fieldTopicDescriptionTooltip',
    defaultMessage:
      'Add an optional description to provide more context about this tag.',
  },
  fieldTopicSave: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.GlobalTopics.fieldTopicSave',
    defaultMessage: 'Save tag',
  },
  subtitleTerminology: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.GlobalTopics.subtitleTerminology',
    defaultMessage: 'Terminology (homepage filter)',
  },
  terminologyTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.GlobalTopics.terminologyTooltip',
    defaultMessage:
      "Choose what 'tags' are referred to on the homepage projects filter, e.g. tags, categories, departments, etc. You will need to supply both the singular and plural versions.",
  },
  topicTerm: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.GlobalTopics.topicTerm',
    defaultMessage: 'Term for one tag (singular)',
  },
  topicTermPlaceholder: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.GlobalTopics.topicTermPlaceholder',
    defaultMessage: 'tag',
  },
  topicsTerm: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.GlobalTopics.topicsTerm',
    defaultMessage: 'Term for multiple tags (plural)',
  },
  topicsTermPlaceholder: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.GlobalTopics.topicsTermPlaceholder',
    defaultMessage: 'tags',
  },
  tagIsLinkedToStaticPage: {
    id: 'app.containers.AdminPage.SettingsPage.Topics.GlobalTopics.tagIsLinkedToStaticPage',
    defaultMessage:
      'This tag cannot be deleted because it is being used to display projects on the following custom page(s). You will need to unlink the tag from the page, or delete the page before you can delete the tag.',
  },
});
