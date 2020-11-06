/*
 * AdminPage.DashboardPage Messages
 *
 * This contains all the text for the AdminPage.DashboardPage component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  // Index
  tabSummary: {
    id: 'app.containers.AdminPage.DashboardPage.tabSummary',
    defaultMessage: 'Summary',
  },
  tabUsers: {
    id: 'app.containers.AdminPage.DashboardPage.tabUsers',
    defaultMessage: 'Users',
  },
  tabReports: {
    id: 'app.containers.AdminPage.DashboardPage.tabReports',
    defaultMessage: 'Reports',
  },
  tabInsights: {
    id: 'app.containers.AdminPage.DashboardPage.tabInsights',
    defaultMessage: 'Insights',
  },
  tabMap: {
    id: 'app.containers.AdminPage.DashboardPage.tabMap',
    defaultMessage: 'Map',
  },
  helmetTitle: {
    id: 'app.containers.AdminPage.DashboardPage.helmetTitle',
    defaultMessage: 'Admin dashboard page',
  },
  helmetDescription: {
    id: 'app.containers.AdminPage.DashboardPage.helmetDescription',
    defaultMessage: 'Dashboard for activities on the platform',
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
  // Filter Controls
  allGroups: {
    id: 'app.containers.AdminPage.DashboardPage.allGroups',
    defaultMessage: 'All Groups',
  },
  hiddenLabelGroupFilter: {
    id: 'app.containers.AdminPage.DashboardPage.hiddenLabelGroupFilter',
    defaultMessage: 'Pick group filter',
  },
  allProjects: {
    id: 'app.containers.AdminPage.DashboardPage.allProjects',
    defaultMessage: 'All Projects',
  },
  hiddenLabelProjectFilter: {
    id: 'app.containers.AdminPage.DashboardPage.hiddenLabelProjectFilter',
    defaultMessage: 'Pick project filter',
  },
  allTopics: {
    id: 'app.containers.AdminPage.DashboardPage.allTopics',
    defaultMessage: 'All Topics',
  },
  hiddenLabelTopicFilter: {
    id: 'app.containers.AdminPage.DashboardPage.hiddenLabelTopicFilter',
    defaultMessage: 'Pick topic filter',
  },
  // Time and Resolution Controls
  resolutionday: {
    id: 'app.containers.AdminPage.DashboardPage.resolutionday',
    defaultMessage: 'in Days',
  },
  resolutionweek: {
    id: 'app.containers.AdminPage.DashboardPage.resolutionweek',
    defaultMessage: 'in Weeks',
  },
  resolutionmonth: {
    id: 'app.containers.AdminPage.DashboardPage.resolutionmonth',
    defaultMessage: 'in Months',
  },
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
  activeUsersDescription: {
    id: 'app.containers.AdminPage.DashboardPage.activeUsersDescription',
    defaultMessage:
      'The number of users that either voted, commented or posted an idea on a given day.',
  },
  ideasByTimeTitle: {
    id: 'app.containers.AdminPage.DashboardPage.ideasByTimeTitle',
    defaultMessage: 'Ideas',
  },
  ideasByStatusTitle: {
    id: 'app.containers.AdminPage.DashboardPage.ideasByStatusTitle',
    defaultMessage: 'Ideas By Status',
  },
  commentsByTimeTitle: {
    id: 'app.containers.AdminPage.DashboardPage.commentsByTimeTitle',
    defaultMessage: 'Comments',
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
  outsideArea: {
    id: 'app.containers.AdminPage.DashboardPage.outsideArea',
    defaultMessage: 'Somewhere else',
  },
  top10activeUsersDescription: {
    id: 'app.containers.AdminPage.DashboardPage.top10activeUsersDescription',
    defaultMessage:
      'A user gets 5 points per posted idea, 3 points per posted comment and 1 point per vote.',
  },
  mostActiveUsers: {
    id: 'app.containers.AdminPage.DashboardPage.mostActiveUsers',
    defaultMessage: 'Most active users',
  },
  deletedUser: {
    id: 'app.containers.AdminPage.DashboardPage.deletedUser',
    defaultMessage: 'Deleted user',
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
  mapHelperText: {
    id: 'app.containers.AdminPage.DashboardPage.mapHelperText',
    defaultMessage:
      'This map shows ideas at locations that are automatically detected from the idea text. Some locations can be inaccurate. Ideas for which no locations were found are not shown.',
  },
  startLoadingMessage: {
    id: 'app.containers.AdminPage.DashboardPage.startLoadingMessage',
    defaultMessage:
      'Currently crunching all your data to spot locations. Bear with me, this might take some time.',
  },
  thenLoadingMessage: {
    id: 'app.containers.AdminPage.DashboardPage.thenLoadingMessage',
    defaultMessage:
      'Fun Fact: it will probably be way faster the next time you come here!',
  },
  lastLoadingMessage: {
    id: 'app.containers.AdminPage.DashboardPage.lastLoadingMessage',
    defaultMessage: 'It should be almost ready, hang on!',
  },
  downloadAsImage: {
    id: 'app.containers.AdminPage.DashboardPage.ExportMenu.downloadAsImage',
    defaultMessage: 'Download as image',
  },
  downloadXlsx: {
    id: 'app.containers.AdminPage.DashboardPage.ExportMenu.downloadXlsx',
    defaultMessage: 'Download Excel',
  },
  fromFilter: {
    id: 'app.containers.AdminPage.DashboardPage.ExportMenu.FileName.fromFilter',
    defaultMessage: 'from',
  },
  untilFilter: {
    id:
      'app.containers.AdminPage.DashboardPage.ExportMenu.FileName.untilFilter',
    defaultMessage: 'until',
  },
  projectFilter: {
    id:
      'app.containers.AdminPage.DashboardPage.ExportMenu.FileName.projectFilter',
    defaultMessage: 'project',
  },
  groupFilter: {
    id:
      'app.containers.AdminPage.DashboardPage.ExportMenu.FileName.groupFilter',
    defaultMessage: 'group',
  },
  topicFilter: {
    id:
      'app.containers.AdminPage.DashboardPage.ExportMenu.FileName.topicFilter',
    defaultMessage: 'topic',
  },
  participants: {
    id: 'app.containers.AdminPage.DashboardPage.Report.participants',
    defaultMessage: 'participants',
  },
  totalUsers: {
    id: 'app.containers.AdminPage.DashboardPage.Report.totalUsers',
    defaultMessage: 'total users on the platform',
  },
  // Report
  selectAProject: {
    id: 'app.containers.Dashboards.ReportsTab.selectAProject',
    defaultMessage: 'What project are you interested in ?',
  },
  sectionWho: {
    id: 'app.containers.Dashboards.ReportsTab.sectionWho',
    defaultMessage: 'Who participated ?',
  },
  sectionWhatInput: {
    id: 'app.containers.Dashboards.ReportsTab.sectionWhatInput',
    defaultMessage: '"What input did you collect?"',
  },
  participantsOverTimeTitle: {
    id: 'app.containers.Dashboards.ReportsTab.participantsOverTimeTitle',
    defaultMessage: 'Participants',
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
  ideation: {
    id: 'app.containers.AdminPage.ReportsTab.ideation',
    defaultMessage: 'ideation',
  },
  information: {
    id: 'app.containers.AdminPage.ReportsTab.information',
    defaultMessage: 'information',
  },
  survey: {
    id: 'app.containers.AdminPage.ReportsTab.survey',
    defaultMessage: 'survey',
  },
  budgeting: {
    id: 'app.containers.AdminPage.ReportsTab.budgeting',
    defaultMessage: 'budgeting',
  },
  poll: {
    id: 'app.containers.AdminPage.ReportsTab.poll',
    defaultMessage: 'poll',
  },
  volunteering: {
    id: 'app.containers.AdminPage.ReportsTab.volunteering',
    defaultMessage: 'volunteering',
  },
  customFieldTitleExport: {
    id: 'app.containers.AdminPage.ReportsTab.customFieldTitleExport',
    defaultMessage: '{fieldName}_repartition',
  },
});
