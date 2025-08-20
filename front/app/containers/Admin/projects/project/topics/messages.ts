import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.containers.AdminPage.Topics.title',
    defaultMessage: 'Allowed input tags',
  },
  browseTopics: {
    id: 'app.containers.AdminPage.Topics.browseTopics',
    defaultMessage: 'Browse topics',
  },
  addTopics: {
    id: 'app.containers.AdminPage.Topics.addTopics',
    defaultMessage: 'Add',
  },
  deleteTopicLabel: {
    id: 'app.containers.AdminPage.Topics.deleteTopicLabel',
    defaultMessage: 'Delete',
  },
  remove: {
    id: 'app.containers.AdminPage.Topics.remove',
    defaultMessage: 'Remove',
  },
  confirmHeader: {
    id: 'app.containers.AdminPage.Topics.confirmHeader',
    defaultMessage: 'Are you sure you want to delete this project topic?',
  },
  generalTopicDeletionWarning: {
    id: 'app.containers.AdminPage.Topics.generalTopicDeletionWarning',
    defaultMessage: 'This topic will no longer be able to used in projects.',
  },
  cancel: {
    id: 'app.containers.AdminPage.Topics.cancel',
    defaultMessage: 'Cancel',
  },
  delete: {
    id: 'app.containers.AdminPage.Topics.delete',
    defaultMessage: 'Delete',
  },
  topicManagerInfo: {
    id: 'app.containers.AdminPage.Topics.topicManagerInfo',
    defaultMessage:
      'If you would like to add additional project topics, you can do so in the {topicManagerLink}.',
  },
  projectTopicsDescription: {
    id: 'app.containers.AdminPage.Topics.projectTopicsDescription',
    defaultMessage:
      'You can add and delete the topics that can be assigned to inputs in this project.',
  },
  topicManager: {
    id: 'app.containers.AdminPage.Topics.topicManager',
    defaultMessage: 'Topic Manager',
  },
  lastTopicWarning: {
    id: 'app.containers.AdminPage.Topics.lastTopicWarning2',
    defaultMessage:
      'At least one topic is required. If you do not wish to use tags, the ‘Tags’ item can be deleted from any phase’s input form (if present).',
  },
  inputForm: {
    id: 'app.containers.AdminPage.Topics.inputForm',
    defaultMessage: 'Input form',
  },
});
