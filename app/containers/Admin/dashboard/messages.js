/*
 * AdminPage.DashboardPage Messages
 *
 * This contains all the text for the AdminPage.DashboardPage component.
 */
import {
  defineMessages
} from 'react-intl';

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
    defaultMessage: 'Dashboard',
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
  activeUsersByTimeTitle: {
    id: 'app.containers.AdminPage.DashboardPage.activeUsersByTimeTitle',
    defaultMessage: 'Active users',
  },
  activeUsersDescription: {
    id: 'app.containers.AdminPage.DashboardPage.activeUsersDescription',
    defaultMessage: 'The number of users that either voted, commented or posted an idea on a given day.',
  },
  commentsByTimeTitle: {
    id: 'app.containers.AdminPage.DashboardPage.commentsByTimeTitle',
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
  users: {
    id: 'app.containers.AdminPage.DashboardPage.Users',
    defaultMessage: 'Users',
  },
  activeUsers: {
    id: 'app.containers.AdminPage.DashboardPage.activeUsers',
    defaultMessage: 'Active users',
  },
  ideas: {
    id: 'app.containers.AdminPage.DashboardPage.Ideas',
    defaultMessage: 'Ideas',
  },
  votes: {
    id: 'app.containers.AdminPage.DashboardPage.Votes',
    defaultMessage: 'Votes',
  },
  comments: {
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
  participationPerProjectComparison: {
    id: 'app.containers.AdminPage.DashboardPage.participationPerProjectComparison',
    defaultMessage: 'Participation difference with project {projectName}',
  },
  participationPerTopicComparison: {
    id: 'app.containers.AdminPage.DashboardPage.participationPerTopicComparison',
    defaultMessage: 'Participation difference with topic {topicName}',
  },
  totalCountTopic: {
    id: 'app.containers.AdminPage.DashboardPage.totalCountTopic',
    defaultMessage: '{selectedResourceName} total in {topicName} topic : {totalCount}',
  },
  totalCountProject: {
    id: 'app.containers.AdminPage.DashboardPage.totalCountProject',
    defaultMessage: '{selectedResourceName} total in {projectName} project : {totalCount}',
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
  },
  previous30Days: {
    id: 'app.containers.AdminPage.DashboardPage.previous30Days',
    defaultMessage: 'Previous 30 days',
  },
  previousWeek: {
    id: 'app.containers.AdminPage.DashboardPage.previousWeek',
    defaultMessage: 'Previous week',
  },
  previous90Days: {
    id: 'app.containers.AdminPage.DashboardPage.previous90Days',
    defaultMessage: 'Previous 90 days',
  },
  previousYear: {
    id: 'app.containers.AdminPage.DashboardPage.previousYear',
    defaultMessage: 'Previous year',
  },
  allTime: {
    id: 'app.containers.AdminPage.DashboardPage.allTime',
    defaultMessage: 'All Time',
  },
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
  resolutionday: {
    id: 'app.containers.AdminPage.DashboardPage.resolutionday',
    defaultMessage: ' in Days',
  },
  resolutionweek: {
    id: 'app.containers.AdminPage.DashboardPage.resolutionweek',
    defaultMessage: 'in Weeks',
  },
  resolutionmonth: {
    id: 'app.containers.AdminPage.DashboardPage.resolutionmonth',
    defaultMessage: 'in Months',
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
  customDateRange: {
    id: 'app.containers.AdminPage.DashboardPage.customDateRange',
    defaultMessage: 'Custom',
  },
});
