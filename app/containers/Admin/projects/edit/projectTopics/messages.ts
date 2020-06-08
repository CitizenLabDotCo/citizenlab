import {
  defineMessages
} from 'react-intl';

export default defineMessages({
  titleDescription: {
    id: 'app.containers.AdminPage.Topics.titleDescription',
    defaultMessage: 'Topics',
  },
  subtitleDescription: {
    id: 'app.containers.AdminPage.Topics.subtitleDescription',
    defaultMessage: 'Add or remove topics that are available to this project. Topics can be managed in the topic manager.',
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
  fewerThanOneTopicForbidden: {
    id: 'app.containers.AdminPage.Topics.fewerThanOneTopicForbidden',
    defaultMessage: 'A project needs at least one topic. If you want to disable topics for this project, you can do so in the \'Idea form\' tab.'
  },
});
