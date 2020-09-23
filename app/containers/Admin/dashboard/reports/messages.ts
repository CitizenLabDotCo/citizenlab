/*
 * AdminPage.DashboardPage Messages
 *
 * This contains all the text for the AdminPage.DashboardPage component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  selectAProject: {
    id: 'app.containers.Dashboards.ReportsTab.selectAProject',
    defaultMessage: 'What project are you interrested in ?',
  },
  sectionWho: {
    id: 'app.containers.Dashboards.ReportsTab.sectionWho',
    defaultMessage: 'Who participated ?',
  },
  sectionWhat: {
    id: 'app.containers.Dashboards.ReportsTab.sectionWhat',
    defaultMessage: 'What ?',
  },
  participantsOverTimeTitle: {
    id: 'app.containers.Dashboards.ReportsTab.participantsOverTimeTitle',
    defaultMessage: 'Participants',
  },
  ideasByTimeTitle: {
    id: 'app.containers.Dashboards.ReportsTab.ideasByTimeTitle',
    defaultMessage: 'Ideas',
  },
  commentsByTimeTitle: {
    id: 'app.containers.Dashboards.ReportsTab.commentsByTimeTitle',
    defaultMessage: 'Ideas',
  },
  users: {
    id: 'app.containers.AdminPage.DashboardPage.users',
    defaultMessage: 'Users',
  },
  ideas: {
    id: 'app.containers.AdminPage.DashboardPage.ideas',
    defaultMessage: 'Ideas',
  },
  votes: {
    id: 'app.containers.AdminPage.DashboardPage.votes',
    defaultMessage: 'Votes',
  },
  ideaVotes: {
    id: 'app.containers.AdminPage.DashboardPage.ideaVotes',
    defaultMessage: 'Votes on ideas',
  },
  fiveIdeasWithMostVotes: {
    id: 'app.containers.AdminPage.DashboardPage.fiveIdeasWithMostVotes',
    defaultMessage: '5 Ideas With Most Votes',
  },
  comments: {
    id: 'app.containers.AdminPage.DashboardPage.comments',
    defaultMessage: 'Comments',
  },
  noData: {
    id: 'app.containers.AdminPage.DashboardPage.noData',
    defaultMessage: 'No data available with the current filters.',
  },
  // Summary Graphs
  usersByTimeTitle: {
    id: 'app.containers.AdminPage.DashboardPage.usersByTimeTitle',
    defaultMessage: 'Users',
  },
  activeUsers: {
    id: 'app.containers.AdminPage.DashboardPage.activeUsers',
    defaultMessage: 'Active users',
  },
  activeUsersByTimeTitle: {
    id: 'app.containers.AdminPage.DashboardPage.activeUsersByTimeTitle',
    defaultMessage: 'Active users',
  },
  activeUsersDescription: {
    id: 'app.containers.AdminPage.DashboardPage.activeUsersDescription',
    defaultMessage:
      'The number of users that either voted, commented or posted an idea on a given day.',
  },
  ideasByStatusTitle: {
    id: 'app.containers.AdminPage.DashboardPage.ideasByStatusTitle',
    defaultMessage: 'Ideas By Status',
  },
  ideaVotesByTimeTitle: {
    id: 'app.containers.AdminPage.DashboardPage.ideaVotesByTimeTitle',
    defaultMessage: 'Votes on ideas',
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
  cumulatedTotal: {
    id: 'app.containers.AdminPage.DashboardPage.cumulatedTotal',
    defaultMessage: 'Cumulated Total',
  },
  total: {
    id: 'app.containers.AdminPage.DashboardPage.total',
    defaultMessage: 'Total',
  },
  totalForPeriod: {
    id: 'app.containers.AdminPage.DashboardPage.totalForPeriod',
    defaultMessage: 'This {period}',
  },
  perPeriod: {
    id: 'app.containers.AdminPage.DashboardPage.perPeriod',
    defaultMessage: 'Per {period}',
  },
  participationPerProject: {
    id: 'app.containers.AdminPage.DashboardPage.participationPerProject',
    defaultMessage: 'Participation per project',
  },
  hiddenLabelPickResourceByProject: {
    id:
      'app.containers.AdminPage.DashboardPage.hiddenLabelPickResourceByProject',
    defaultMessage: 'Pick resource to show by project',
  },
  selectedProject: {
    id: 'app.containers.AdminPage.DashboardPage.selectedProject',
    defaultMessage: 'current project filter',
  },
  participationPerTopic: {
    id: 'app.containers.AdminPage.DashboardPage.participationPerTopic',
    defaultMessage: 'Participation per topic',
  },
  hiddenLabelPickResourceByTopic: {
    id: 'app.containers.AdminPage.DashboardPage.hiddenLabelPickResourceByTopic',
    defaultMessage: 'Pick resource to show by topic',
  },
  selectedTopic: {
    id: 'app.containers.AdminPage.DashboardPage.selectedTopic',
    defaultMessage: 'current topic filter',
  },
  totalCount: {
    id: 'app.containers.AdminPage.DashboardPage.totalCount',
    defaultMessage:
      '{selectedResourceName} total in {selectedName} : {selectedCount}',
  },
  resourceByDifference: {
    id: 'app.containers.AdminPage.DashboardPage.resourceByDifference',
    defaultMessage: '{selectedResourceName} difference with {selectedName}',
  },
});
