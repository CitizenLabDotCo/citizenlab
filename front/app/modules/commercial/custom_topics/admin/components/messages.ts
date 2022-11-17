import { defineMessages } from 'react-intl';

export default defineMessages({
  allowedInputTopicsTab: {
    id: 'app.containers.AdminPage.ProjectEdit.allowedInputTopicsTab',
    defaultMessage: 'Allowed input tags',
  },
  tabTopics: {
    id: 'app.containers.AdminPage.SettingsPage.tabTopics',
    defaultMessage: 'Tag manager',
  },
  deleteButtonLabel: {
    id: 'app.containers.AdminPage.SettingsPage.deleteTopicButtonLabel',
    defaultMessage: 'Delete',
  },
  editButtonLabel: {
    id: 'app.containers.AdminPage.SettingsPage.editTopicButtonLabel',
    defaultMessage: 'Edit',
  },
  defaultTopic: {
    id: 'app.containers.AdminPage.SettingsPage.defaultTopic',
    defaultMessage: 'Default topic',
  },
  subtitleTerminology: {
    id: 'app.containers.AdminPage.SettingsPage.AllowedInputTopics.subtitleTerminology',
    defaultMessage: 'Terminology (homepage filter)',
  },
  terminologyTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.AllowedInputTopics.terminologyTooltip',
    defaultMessage:
      "Choose what 'tags' are referred to on the homepage projects filter, e.g. tags, categories, departments, etc. You will need to supply both the singular and plural versions.",
  },
  topicTerm: {
    id: 'app.containers.AdminPage.SettingsPage.AllowedInputTopics.topicTerm2',
    defaultMessage: 'Term for one tag (singular)',
  },
  topicTermPlaceholder: {
    id: 'app.containers.AdminPage.SettingsPage.AllowedInputTopics.topicTermPlaceholder',
    defaultMessage: 'tag',
  },
  topicsTerm: {
    id: 'app.containers.AdminPage.SettingsPage.AllowedInputTopics.topicsTerm',
    defaultMessage: 'Term for multiple tags (plural)',
  },
  topicsTermPlaceholder: {
    id: 'app.containers.AdminPage.SettingsPage.AllowedInputTopics.topicsTermPlaceholder',
    defaultMessage: 'tags',
  },
  topicInputsTooltipExtraCopy: {
    id: 'app.containers.AdminPage.SettingsPage.AllowedInputTopics.topicInputsTooltipExtraCopy',
    defaultMessage: 'Tags can be configured {topicManagerLink}.',
  },
  topicInputsTooltipLink: {
    id: 'app.containers.AdminPage.SettingsPage.AllowedInputTopics.topicInputsTooltipLink',
    defaultMessage: 'here',
  },
  tagIsLinkedToStaticPage: {
    id: 'app.containers.AdminPage.ProjectEdit.tagIsLinkedToStaticPage',
    defaultMessage:
      'This tag cannot be deleted because it is being used to display projects on the following custom page(s). You will need to unlink the tag from the page, or delete the page before you can delete the tag.',
  },
});
