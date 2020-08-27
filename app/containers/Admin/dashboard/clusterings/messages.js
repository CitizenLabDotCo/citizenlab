/*
 * AdminPage.DashboardPage Messages
 *
 * This contains all the text for the AdminPage.DashboardPage component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  absolute: {
    id: 'app.containers.Admin.clusterViewer.absolute',
    defaultMessage: 'Absolute',
  },
  relative: {
    id: 'app.containers.Admin.clusterViewer.relative',
    defaultMessage: 'Relative',
  },
  gender: {
    id: 'app.containers.Admin.clusterViewer.gender',
    defaultMessage: 'Gender',
  },
  age: {
    id: 'app.containers.Admin.clusterViewer.age',
    defaultMessage: 'Age',
  },
  domicile: {
    id: 'app.containers.Admin.clusterViewer.domicile',
    defaultMessage: 'Domicile',
  },
  relativeTooltip: {
    id: 'app.containers.Admin.clusterViewer.relativeTooltip',
    defaultMessage:
      'This shows the percentage of all votes (on the whole platform) of that user segment (x-axis) that have been put on ideas in the current selection. It acts as weighted scoring for voting behaviour per user segment, allowing to compare user segments regardless of segment size.',
  },
  addClusteringButton: {
    id: 'app.containers.Admin.clusterViewer.addClusteringButton',
    defaultMessage: 'Generate new insight graph',
  },
  fieldTitle: {
    id: 'app.containers.Admin.clusterViewer.fieldTitle',
    defaultMessage: 'Title',
  },
  clusteringDeletionConfirmation: {
    id: 'app.containers.Admin.clusterViewer.clusteringDeletionConfirmation',
    defaultMessage: 'Are you sure?',
  },
  titleClusterings: {
    id: 'app.containers.Admin.clusterViewer.titleClusterings',
    defaultMessage: 'Voting insights',
  },
  deleteButtonLabel: {
    id: 'app.containers.Admin.clusterViewer.deleteButtonLabel',
    defaultMessage: 'Delete',
  },
  viewButtonLabel: {
    id: 'app.containers.Admin.clusterViewer.viewButtonLabel',
    defaultMessage: 'View',
  },
  titleClusterInformation: {
    id: 'app.containers.Admin.clusterViewer.titleClusterInformation',
    defaultMessage: 'Clustering information',
  },
  titleFilters: {
    id: 'app.containers.Admin.clusterViewer.titleFilters',
    defaultMessage: 'Idea filters',
  },
  fieldLevels: {
    id: 'app.containers.Admin.clusterViewer.fieldLevels',
    defaultMessage: 'Levels',
  },
  fieldDropEmpty: {
    id: 'app.containers.Admin.clusterViewer.fieldDropEmpty',
    defaultMessage: "Don't include empty clusters",
  },
  fieldProjects: {
    id: 'app.containers.Admin.clusterViewer.fieldProjects',
    defaultMessage: 'Projects',
  },
  fieldTopics: {
    id: 'app.containers.Admin.clusterViewer.fieldTopics',
    defaultMessage: 'Topics',
  },
  fieldIdeaStatus: {
    id: 'app.containers.Admin.clusterViewer.fieldIdeaStatus',
    defaultMessage: 'Idea statuses',
  },
  fieldSearch: {
    id: 'app.containers.Admin.clusterViewer.fieldSearch',
    defaultMessage: 'Including search term',
  },
  fieldMinimalTotalVotes: {
    id: 'app.containers.Admin.clusterViewer.fieldMinimalTotalVotes',
    defaultMessage: 'Minimal idea votes',
  },
  fieldMinimalUpvotes: {
    id: 'app.containers.Admin.clusterViewer.fieldMinimalUpvotes',
    defaultMessage: 'Minimal idea upvotes',
  },
  fieldMinimalDownvotes: {
    id: 'app.containers.Admin.clusterViewer.fieldMinimalDownvotes',
    defaultMessage: 'Minimal idea downvotes',
  },
  level_project: {
    id: 'app.containers.Admin.clusterViewer.level_project',
    defaultMessage: 'Project',
  },
  level_topic: {
    id: 'app.containers.Admin.clusterViewer.level_topic',
    defaultMessage: 'Topic',
  },
  level_area: {
    id: 'app.containers.Admin.clusterViewer.level_area',
    defaultMessage: 'Area',
  },
  level_clustering: {
    id: 'app.containers.Admin.clusterViewer.level_clustering',
    defaultMessage: 'AI Magic',
  },
  firstLevel: {
    id: 'app.containers.Admin.clusterViewer.firstLevel',
    defaultMessage: 'First group all ideas by {level}',
  },
  thenLevel: {
    id: 'app.containers.Admin.clusterViewer.thenLevel',
    defaultMessage: 'within group them by {level}',
  },
  keywords: {
    id: 'app.containers.Admin.clusterViewer.keywords',
    defaultMessage: 'Keywords',
  },
  clusterContains: {
    id: 'app.containers.Admin.clusterViewer.clusterContains',
    defaultMessage: 'This cluster contains the following ideas',
  },
  idea: {
    id: 'app.containers.Admin.clusterViewer.idea',
    defaultMessage: 'Idea',
  },
  project: {
    id: 'app.containers.Admin.clusterViewer.project',
    defaultMessage: 'Project',
  },
  topic: {
    id: 'app.containers.Admin.clusterViewer.topic',
    defaultMessage: 'Topic',
  },
  legend: {
    id: 'app.containers.Admin.clusterViewer.legend',
    defaultMessage: 'Legend',
  },
  controls: {
    id: 'app.containers.Admin.clusterViewer.controls',
    defaultMessage: 'Controls',
  },
  upvotes: {
    id: 'app.containers.Admin.clusterViewer.upvotes',
    defaultMessage: 'More upvotes',
  },
  downvotes: {
    id: 'app.containers.Admin.clusterViewer.downvotes',
    defaultMessage: 'More downvotes',
  },
  noVotes: {
    id: 'app.containers.Admin.clusterViewer.noVotes',
    defaultMessage: 'No votes',
  },
  numVotes: {
    id: 'app.containers.Admin.clusterViewer.numVotes',
    defaultMessage: 'N° of votes',
  },
  clickLegend: {
    id: 'app.containers.Admin.clusterViewer.clickLegend',
    defaultMessage: 'Select node to see details',
  },
  shiftLegend: {
    id: 'app.containers.Admin.clusterViewer.shiftLegend',
    defaultMessage: 'Add to list and see selection stats',
  },
  ctrlLegend: {
    id: 'app.containers.Admin.clusterViewer.ctrlLegend',
    defaultMessage: 'Compare nodes',
  },
  male: {
    id: 'app.containers.AdminPage.clusterViewer.male',
    defaultMessage: 'Male',
  },
  female: {
    id: 'app.containers.AdminPage.clusterViewer.female',
    defaultMessage: 'Female',
  },
  unspecified: {
    id: 'app.containers.AdminPage.clusterViewer.unspecified',
    defaultMessage: 'Unspecified',
  },
  _blank: {
    id: 'app.containers.AdminPage.clusterViewer._blank',
    defaultMessage: 'Unknown',
  },
  votes: {
    id: 'app.containers.AdminPage.clusterViewer.votes',
    defaultMessage: 'Votes',
  },
  details: {
    id: 'app.containers.AdminPage.clusterViewer.details',
    defaultMessage: 'Details',
  },
});
