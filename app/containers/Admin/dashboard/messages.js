/*
 * AdminPage.DashboardPage Messages
 *
 * This contains all the text for the AdminPage.DashboardPage component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  //NEW MESSAGES
  tabSummary: {
    id: 'app.containers.AdminPage.DashboardPage.tabSummary',
    defaultMessage: 'Summary',
  },
  tabUsers: {
    id: 'app.containers.AdminPage.DashboardPage.tabUsers',
    defaultMessage: 'Users',
  },
  tabAcquisition: {
    id: 'app.containers.AdminPage.DashboardPage.tabAcquisition',
    defaultMessage: 'Acquisition',
  },
  viewPublicResource: {
    id: 'app.containers.AdminPage.DashboardPage.viewPublicResource',
    defaultMessage: 'Dashboards',
  },
  emptyUsers: {
    id: 'app.containers.AdminPage.DashboardPage.emptyUsers',
    defaultMessage: 'No users',
  },
  emptyActiveUsers: {
    id: 'app.containers.AdminPage.DashboardPage.emptyActiveUsers',
    defaultMessage: 'No active users',
  },
  emptyIdeas: {
    id: 'app.containers.AdminPage.DashboardPage.emptyIdeas',
    defaultMessage: 'No ideas',
  },
  emptyComments: {
    id: 'app.containers.AdminPage.DashboardPage.emptyComments',
    defaultMessage: 'No comments',
  },
  emptyVotes: {
    id: 'app.containers.AdminPage.DashboardPage.emptyVotes',
    defaultMessage: 'No votes',
  },
  numberOfUsers: {
    id: 'app.containers.AdminPage.DashboardPage.numberOfUsers',
    defaultMessage: 'Users',
  },
  activeUsersByTimeTitle: {
    id: 'app.containers.AdminPage.DashboardPage.activeUsersByTimeTitle',
    defaultMessage: 'Active users',
  },
  activeUsersDescription: {
    id: 'app.containers.AdminPage.DashboardPage.activeUsersDescription',
    defaultMessage: 'The number of users that either voted, commented or posted an idea on a given day.',
  },
  numberOfActiveUsers: {
    id: 'app.containers.AdminPage.DashboardPage.numberOfActiveUsers',
    defaultMessage: 'Active users',
  },
  commentsByTimeTitle: {
    id: 'app.containers.AdminPage.DashboardPage.commentsByTimeTitle',
    defaultMessage: 'Comments',
  },
  numberOfComments: {
    id: 'app.containers.AdminPage.DashboardPage.numberOfComments',
    defaultMessage: 'Comments',
  },
  votesByTimeTitle: {
    id: 'app.containers.AdminPage.DashboardPage.votesByTimeTitle',
    defaultMessage: 'Votes',
  },
  numberOfVotesUp: {
    id: 'app.containers.AdminPage.DashboardPage.numberOfVotesUp',
    defaultMessage: 'Upvotes',
  },
  numberOfVotesDown: {
    id: 'app.containers.AdminPage.DashboardPage.numberOfVotesDown',
    defaultMessage: 'Downvotes',
  },
  numberOfVotesTotal: {
    id: 'app.containers.AdminPage.DashboardPage.numberOfVotesTotal',
    defaultMessage: 'Total votes',
  },
  numberOfIdeas: {
    id: 'app.containers.AdminPage.DashboardPage.numberOfIdeas',
    defaultMessage: 'Ideas',
  },
  'Ideas': {
    id: 'app.containers.AdminPage.DashboardPage.Ideas',
    defaultMessage: 'Ideas',
  },
  'Votes': {
    id: 'app.containers.AdminPage.DashboardPage.Votes',
    defaultMessage: 'Votes',
  },
  'Comments': {
    id: 'app.containers.AdminPage.DashboardPage.Comments',
    defaultMessage: 'Comments',
  },
  byTopicTitle: {
    id: 'app.containers.AdminPage.DashboardPage.byTopicTitle',
    defaultMessage: 'by topic',
  },
  participationPerProject: {
    id: 'app.containers.AdminPage.DashboardPage.participationPerProject',
    defaultMessage: 'Participation per project',
  },
  participationPerTopic: {
    id: 'app.containers.AdminPage.DashboardPage.participationPerTopic',
    defaultMessage: 'Participation per topic',
  },
  byProjectTitle: {
    id: 'app.containers.AdminPage.DashboardPage.byProjectTitle',
    defaultMessage: 'by project',
  },
  resourceByTopicDifference: {
    id: 'app.containers.AdminPage.DashboardPage.resourceByTopicDifference',
    defaultMessage: '{resourceName} difference with {topic}',
  },
  resourceByProjectDifference: {
    id: 'app.containers.AdminPage.DashboardPage.resourceByProjectDifference',
    defaultMessage: '{resourceName} difference with {project}',
  },
  selectedProject: {
    id: 'app.containers.AdminPage.DashboardPage.selectedProject',
    defaultMessage: 'current project filter',
  },
  selectedTopic: {
    id: 'app.containers.AdminPage.DashboardPage.selectedTopic',
    defaultMessage: 'current topic filter',
  noData: {
    id: 'app.containers.AdminPage.DashboardPage.noData',
    defaultMessage: 'No data available with the current filters.',
  },
  //OLD MESSAGES CONFIRMED STILL IN USE
  helmetTitle: {
    id: 'app.containers.AdminPage.DashboardPage.helmetTitle',
    defaultMessage: 'Admin dashboard page',
  },
  helmetDescription: {
    id: 'app.containers.AdminPage.DashboardPage.helmetDescription',
    defaultMessage: 'Dashboard for activities on the platform',
  },
  //OLD MESSAGES
  loading: {
    id: 'app.containers.AdminPage.DashboardPage.loading',
    defaultMessage: 'Loading...',
  },
  loadError: {
    id: 'app.containers.AdminPage.DashboardPage.loadError',
    defaultMessage: 'Couldn\' load data',
  },
  usersOverTime: {
    id: 'app.containers.AdminPage.DashboardPage.usersOverTime',
    defaultMessage: 'Users over time',
  },
  usersByGenderTitle: {
    id: 'app.containers.AdminPage.DashboardPage.usersByGenderTitle',
    defaultMessage: 'Users by gender',
  },
  usersByAgeTitle: {
    id: 'app.containers.AdminPage.DashboardPage.usersByAgeTitle',
    defaultMessage: 'Users by age',
  },
  ideasByTimeTitle: {
    id: 'app.containers.AdminPage.DashboardPage.ideasByTimeTitle',
    defaultMessage: 'Ideas',
  },
  usersByTimeTitle: {
    id: 'app.containers.AdminPage.DashboardPage.usersByTimeTitle',
    defaultMessage: 'Users',
  },
  ideasByTopicTitle: {
    id: 'app.containers.AdminPage.DashboardPage.ideasByTopicTitle',
    defaultMessage: 'Ideas by topic',
  },
  ideasByArea: {
    id: 'app.containers.AdminPage.DashboardPage.ideasByArea',
    defaultMessage: 'Ideas by area',
  },
  interval: {
    id: 'app.containers.AdminPage.DashboardPage.interval',
    defaultMessage: 'Interval',
  },
  day: {
    id: 'app.containers.AdminPage.DashboardPage.day',
    defaultMessage: 'Day',
  },
  week: {
    id: 'app.containers.AdminPage.DashboardPage.week',
    defaultMessage: 'Week',
  },
  month: {
    id: 'app.containers.AdminPage.DashboardPage.month',
    defaultMessage: 'Month',
  },
  year: {
    id: 'app.containers.AdminPage.DashboardPage.year',
    defaultMessage: 'Year',
  },
  male: {
    id: 'app.containers.AdminPage.DashboardPage.male',
    defaultMessage: 'male',
  },
  female: {
    id: 'app.containers.AdminPage.DashboardPage.female',
    defaultMessage: 'female',
  },
  unspecified: {
    id: 'app.containers.AdminPage.DashboardPage.unspecified',
    defaultMessage: 'unspecified',
  },
  _blank: {
    id: 'app.containers.AdminPage.DashboardPage._blank',
    defaultMessage: 'unknown',
  },
  numberOfRegistrations: {
    id: 'app.containers.AdminPage.DashboardPage.numberOfRegistrations',
    defaultMessage: '#registrations',
  },
  numberOfIdeas: {
    id: 'app.containers.AdminPage.DashboardPage.numberOfIdeas',
    defaultMessage: '#ideas',
  },
  tryOutInsights: {
    id: 'app.containers.AdminPage.DashboardPage.tryOutInsights',
    defaultMessage: 'Try out {insightsLink}, our new beta feature',
  },
  insightsLinkText: {
    id: 'app.containers.AdminPage.DashboardPage.insightsLinkText',
    defaultMessage: 'insights',
  },
  projectFilterLabel: {
    id: 'app.containers.AdminPage.DashboardPage.projectFilterLabel',
    defaultMessage: 'Projects',
  },
  groupFilterLabel: {
    id: 'app.containers.AdminPage.DashboardPage.groupFilterLabel',
    defaultMessage: 'Groups',
  },
  topicFilterLabel: {
    id: 'app.containers.AdminPage.DashboardPage.topicFilterLabel',
    defaultMessage: 'Topics',
  },
});
