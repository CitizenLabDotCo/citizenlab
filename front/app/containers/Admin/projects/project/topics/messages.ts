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
    id: 'app.containers.AdminPage.Topics.confirmHeader1',
    defaultMessage: 'Are you sure you want to delete this project tag?',
  },
  generalTopicDeletionWarning: {
    id: 'app.containers.AdminPage.Topics.generalTopicDeletionWarning1',
    defaultMessage: 'This tag will no longer be able to used in projects.',
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
    id: 'app.containers.AdminPage.Topics.topicManagerInfo1',
    defaultMessage:
      'If you would like to add additional project tags, you can do so in the {topicManagerLink}.',
  },
  projectTopicsDescription: {
    id: 'app.containers.AdminPage.Topics.projectTopicsDescription1',
    defaultMessage:
      'You can add and delete the tags that can be assigned to inputs in this project.',
  },
  topicManager: {
    id: 'app.containers.AdminPage.Topics.topicManager1',
    defaultMessage: 'Tag Manager',
  },
  lastTopicWarning: {
    id: 'app.containers.AdminPage.Topics.lastTopicWarning3',
    defaultMessage:
      'At least one tag is required. If you do not wish to use tags, the ‘Tags’ item can be deleted from any phase’s input form (if present).',
  },
  inputForm: {
    id: 'app.containers.AdminPage.Topics.inputForm',
    defaultMessage: 'Input form',
  },
});
