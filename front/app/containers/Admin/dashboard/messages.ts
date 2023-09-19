/*
 * AdminPage.DashboardPage Messages
 *
 * This contains all the text for the AdminPage.DashboardPage component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  // Index
  tabOverview: {
    id: 'app.containers.AdminPage.DashboardPage.tabOverview',
    defaultMessage: 'Overview',
  },
  tabUsers: {
    id: 'app.containers.AdminPage.DashboardPage.tabUsers',
    defaultMessage: 'Users',
  },
  tabReports: {
    id: 'app.containers.AdminPage.DashboardPage.tabReports',
    defaultMessage: 'Reports',
  },
  helmetTitle: {
    id: 'app.containers.AdminPage.DashboardPage.helmetTitle',
    defaultMessage: 'Admin dashboard page',
  },
  helmetDescription: {
    id: 'app.containers.AdminPage.DashboardPage.helmetDescription',
    defaultMessage: 'Dashboard for activities on the platform',
  },
  selectProject: {
    id: 'app.containers.AdminPage.DashboardPage.selectProject',
    defaultMessage: 'Select project',
  },
  // All tabs
  day: {
    id: 'app.containers.AdminPage.DashboardPage.day',
    defaultMessage: 'day',
  },
  week: {
    id: 'app.containers.AdminPage.DashboardPage.week',
    defaultMessage: 'week',
  },
  month: {
    id: 'app.containers.AdminPage.DashboardPage.month',
    defaultMessage: 'month',
  },
  users: {
    id: 'app.containers.AdminPage.DashboardPage.users',
    defaultMessage: 'Users',
  },
  inputs: {
    id: 'app.containers.AdminPage.DashboardPage.inputs',
    defaultMessage: 'Inputs',
  },
  reactions: {
    id: 'app.containers.AdminPage.DashboardPage.reactions',
    defaultMessage: 'Reactions',
  },
  fiveInputsWithMostReactions: {
    id: 'app.containers.AdminPage.DashboardPage.fiveInputsWithMostReactions',
    defaultMessage: 'Top 5 inputs by reactions',
  },
  comments: {
    id: 'app.containers.AdminPage.DashboardPage.comments',
    defaultMessage: 'Comments',
  },
  noData: {
    id: 'app.containers.AdminPage.DashboardPage.noData',
    defaultMessage: 'No data available with the current filters.',
  },
  // Time and Resolution Controls
  customDateRange: {
    id: 'app.containers.AdminPage.DashboardPage.customDateRange',
    defaultMessage: 'Custom',
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
  numberOfActiveParticipantsDescription: {
    id: 'app.containers.AdminPage.DashboardPage.numberOfActiveParticipantsDescription2',
    defaultMessage:
      'The number of participants that posted inputs, reacted or commented.',
  },
  inputsByStatusTitle: {
    id: 'app.containers.AdminPage.DashboardPage.inputsByStatusTitle',
    defaultMessage: 'Inputs by status',
  },
  commentsByTimeTitle: {
    id: 'app.containers.AdminPage.DashboardPage.commentsByTimeTitle',
    defaultMessage: 'Comments',
  },
  numberOfLikes: {
    id: 'app.containers.AdminPage.DashboardPage.numberOfLikes',
    defaultMessage: 'Likes',
  },
  numberOfDislikes: {
    id: 'app.containers.AdminPage.DashboardPage.numberOfDislikes',
    defaultMessage: 'Dislikes',
  },
  numberOfReactionsTotal: {
    id: 'app.containers.AdminPage.DashboardPage.numberOfReactionsTotal',
    defaultMessage: 'Total reactions',
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
    id: 'app.containers.AdminPage.DashboardPage.hiddenLabelPickResourceByProject',
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
  // Users Charts
  usersByAgeTitle: {
    id: 'app.containers.AdminPage.DashboardPage.usersByAgeTitle',
    defaultMessage: 'Users by age',
  },
  usersByDomicileTitle: {
    id: 'app.containers.AdminPage.DashboardPage.usersByDomicileTitle',
    defaultMessage: 'Users by domicile',
  },
  usersByGenderTitle: {
    id: 'app.containers.AdminPage.DashboardPage.usersByGenderTitle',
    defaultMessage: 'Users by gender',
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
  true: {
    id: 'app.containers.AdminPage.DashboardPage.true',
    defaultMessage: 'true',
  },
  false: {
    id: 'app.containers.AdminPage.DashboardPage.false',
    defaultMessage: 'false',
  },
  otherArea: {
    id: 'app.containers.AdminPage.DashboardPage.otherArea',
    defaultMessage: 'Other',
  },
  mostActiveUsersRankingDescription: {
    id: 'app.containers.AdminPage.DashboardPage.mostActiveUsersRankingDescription2',
    defaultMessage:
      'The ranking is based on the number of inputs (5 points per input), comments (3 points per comment) and reactions (1 point per reaction) submitted by each participant.',
  },
  subtitleDashboard: {
    id: 'app.containers.AdminPage.DashboardPage.subtitleDashboard',
    defaultMessage:
      'Get immediate and easy-to-grasp analytics into what’s moving on the platform.',
  },
  titleDashboard: {
    id: 'app.containers.AdminPage.DashboardPage.titleDashboard',
    defaultMessage: 'Dashboard',
  },
  participants: {
    id: 'app.containers.AdminPage.DashboardPage.Report.participants',
    defaultMessage: 'participants',
  },
  totalUsers: {
    id: 'app.containers.AdminPage.DashboardPage.Report.totalUsers',
    defaultMessage: 'total users on the platform',
  },
  timelineType: {
    id: 'app.containers.AdminPage.DashboardPage.timelineType',
    defaultMessage: 'Timeline',
  },
  continuousType: {
    id: 'app.containers.AdminPage.DashboardPage.continuousType',
    defaultMessage: 'Continuous',
  },
  projectType: {
    id: 'app.containers.AdminPage.DashboardPage.projectType',
    defaultMessage: 'Project type : {projectType}',
  },
  fromTo: {
    id: 'app.containers.AdminPage.DashboardPage.fromTo',
    defaultMessage: 'from {from} to {to}',
  },
  noPhase: {
    id: 'app.containers.AdminPage.DashboardPage.noPhase',
    defaultMessage: 'No phase created for this project',
  },
  customFieldTitleExport: {
    id: 'app.containers.AdminPage.ReportsTab.customFieldTitleExport',
    defaultMessage: '{fieldName}_repartition',
  },
  showMore: {
    id: 'app.containers.AdminPage.DashboardPage.overview.showMore',
    defaultMessage: 'Show more',
  },
  showLess: {
    id: 'app.containers.AdminPage.DashboardPage.overview.showLess',
    defaultMessage: 'Show less',
  },
});
