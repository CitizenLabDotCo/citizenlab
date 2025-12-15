import { defineMessages } from 'react-intl';

export default defineMessages({
  voteResults: {
    id: 'app.containers.Admin.projects.insights.voting.voteResults',
    defaultMessage: 'Vote Results',
  },
  online: {
    id: 'app.containers.Admin.projects.insights.voting.online',
    defaultMessage: 'Online',
  },
  offline: {
    id: 'app.containers.Admin.projects.insights.voting.offline',
    defaultMessage: 'Offline',
  },
  clusterBy: {
    id: 'app.containers.Admin.projects.insights.voting.clusterBy',
    defaultMessage: 'CLUSTER BY',
  },
  none: {
    id: 'app.containers.Admin.projects.insights.voting.none',
    defaultMessage: 'None',
  },
  loading: {
    id: 'app.containers.Admin.projects.insights.voting.loading',
    defaultMessage: 'Loading vote results...',
  },
  errorLoading: {
    id: 'app.containers.Admin.projects.insights.voting.errorLoading',
    defaultMessage: 'Error loading vote results',
  },
  noResults: {
    id: 'app.containers.Admin.projects.insights.voting.noResults',
    defaultMessage: 'No vote results yet',
  },
  idea: {
    id: 'app.containers.Admin.projects.insights.voting.idea',
    defaultMessage: 'Idea',
  },
  votesTooltip: {
    id: 'app.containers.Admin.projects.insights.voting.votesTooltip',
    defaultMessage: 'Solid: online votes. Striped: offline votes.',
  },
  unknownDemographic: {
    id: 'app.containers.Admin.projects.insights.voting.unknownDemographic',
    defaultMessage: 'Unknown',
  },
  xVotes: {
    id: 'app.containers.Admin.projects.insights.voting.xVotes',
    defaultMessage: '{count} votes',
  },
  xVotesInclOffline: {
    id: 'app.containers.Admin.projects.insights.voting.xVotesInclOffline',
    defaultMessage: '{count} votes (incl. {offlineCount} offline)',
  },
});
