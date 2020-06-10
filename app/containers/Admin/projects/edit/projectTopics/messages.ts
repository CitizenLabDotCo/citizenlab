import {
  defineMessages
} from 'react-intl';

export default defineMessages({
  titleDescription: {
    id: 'app.containers.AdminPage.Topics.titleDescription',
    defaultMessage: 'Topics',
  },
  browseTopics: {
    id: 'app.containers.AdminPage.Topics.browseTopics',
    defaultMessage: 'Browse topics'
  },
  addTopics: {
    id: 'app.containers.AdminPage.Topics.addTopics',
    defaultMessage: 'Add'
  },
  deleteTopicLabel: {
    id: 'app.containers.AdminPage.Topics.deleteTopicLabel',
    defaultMessage: 'Delete'
  },
  topicDeletionConfirmation: {
    id: 'app.containers.AdminPage.Topics.topicDeletionConfirmation',
    defaultMessage: 'Are you sure you want to delete this topic? This will also remove all existing references between this topic and existing ideas with this topic.'
  },
  remove: {
    id: 'app.containers.AdminPage.Topics.remove',
    defaultMessage: 'Remove'
  },
  confirmHeader: {
    id: 'app.containers.AdminPage.Topics.confirmHeader',
    defaultMessage: 'Do you want to delete this project topic?'
  },
  topicDeletionWarning: {
    id: 'app.containers.AdminPage.Topics.topicDeletionWarning',
    defaultMessage: 'Deleting this topic from the project will also remove the topic from all ideas in this project.'
  },
  cancel: {
    id: 'app.containers.AdminPage.Topics.cancel',
    defaultMessage: 'Cancel'
  },
  delete: {
    id: 'app.containers.AdminPage.Topics.delete',
    defaultMessage: 'Delete'
  },
  projectTopicSettingsDescription: {
    id: 'app.containers.AdminPage.Topics.projectTopicSettingsDescription',
    defaultMessage: 'You can add and delete the topics that are available for Idea Collection projects here. Topics are selected by users to categorize their ideas. If you would like to add additional project topics, you can do so in the {topicManagerLink}.'
  },
  topicManager: {
    id: 'app.containers.AdminPage.Topics.topicManager',
    defaultMessage: 'Topic Manager'
  },
  fewerThanOneTopicWarning: {
    id: 'app.containers.AdminPage.Topics.fewerThanOneTopicWarning',
    defaultMessage: 'Please select at least one topic. If you do not want to allow users to add topics to their ideas, you can disable Topics in the {ideaFormLink} tab.'
  },
  ideaForm: {
    id: 'app.containers.AdminPage.Topics.ideaForm',
    defaultMessage: 'Idea form'
  },
});
