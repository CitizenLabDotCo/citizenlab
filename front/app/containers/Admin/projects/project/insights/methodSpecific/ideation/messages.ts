import { defineMessages } from 'react-intl';

export default defineMessages({
  whatArePeopleSaying: {
    id: 'app.containers.Admin.projects.project.insights.ideation.whatArePeopleSaying',
    defaultMessage: 'What are people saying?',
  },
  refresh: {
    id: 'app.containers.Admin.projects.project.insights.ideation.refresh',
    defaultMessage: 'Refresh',
  },
  explore: {
    id: 'app.containers.Admin.projects.project.insights.ideation.explore',
    defaultMessage: 'Explore',
  },
  loading: {
    id: 'app.containers.Admin.projects.project.insights.ideation.loading',
    defaultMessage: 'Loading...',
  },
  generatingSummary: {
    id: 'app.containers.Admin.projects.project.insights.ideation.generatingSummary',
    defaultMessage: 'Generating summary...',
  },
  inputsLabel: {
    id: 'app.containers.Admin.projects.project.insights.ideation.inputsLabel',
    defaultMessage: 'inputs',
  },
  newResponses: {
    id: 'app.containers.Admin.projects.project.insights.ideation.newResponses',
    defaultMessage:
      '{count, plural, one {# new response} other {# new responses}}',
  },
  topicsAndThemes: {
    id: 'app.containers.Admin.projects.project.insights.ideation.topics',
    defaultMessage: 'Topics',
  },
  noTopics: {
    id: 'app.containers.Admin.projects.project.insights.ideation.noTopics',
    defaultMessage: 'No topics assigned to ideas yet',
  },
  mostLiked: {
    id: 'app.containers.Admin.projects.project.insights.ideation.mostLiked',
    defaultMessage: 'Most liked',
  },
  mostLikedDescription: {
    id: 'app.containers.Admin.projects.project.insights.ideation.mostLikedDescription',
    defaultMessage: 'These conversation threads got the most traction',
  },
  notEnoughInputs: {
    id: 'app.containers.Admin.projects.project.insights.ideation.notEnoughInputs',
    defaultMessage:
      'At least {minInputs} inputs are needed to generate an AI summary. Currently there {count, plural, one {is # input} other {are # inputs}}.',
  },
});
