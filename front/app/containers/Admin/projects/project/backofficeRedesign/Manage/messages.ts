import { defineMessages } from 'react-intl';

export default defineMessages({
  listTitle: {
    id: 'app.containers.Admin.projects.project.manage.listTitle',
    defaultMessage: 'Ideas',
  },
  listSubtitle: {
    id: 'app.containers.Admin.projects.project.manage.listSubtitle',
    defaultMessage:
      'Give feedback, set a status, assign, add tags or move posts to another phase.',
  },
  sortMostLiked: {
    id: 'app.containers.Admin.projects.project.manage.sortMostLiked',
    defaultMessage: 'Sort: Most liked',
  },
  sortNewest: {
    id: 'app.containers.Admin.projects.project.manage.sortNewest',
    defaultMessage: 'Sort: Newest',
  },
  sortOldest: {
    id: 'app.containers.Admin.projects.project.manage.sortOldest',
    defaultMessage: 'Sort: Oldest',
  },
  sortMostComments: {
    id: 'app.containers.Admin.projects.project.manage.sortMostComments',
    defaultMessage: 'Sort: Most comments',
  },
  searchIdeas: {
    id: 'app.containers.Admin.projects.project.manage.searchIdeas',
    defaultMessage: 'Search ideas…',
  },
  filters: {
    id: 'app.containers.Admin.projects.project.manage.filters',
    defaultMessage: 'Filters',
  },
  filtersActive: {
    id: 'app.containers.Admin.projects.project.manage.filtersActive',
    defaultMessage: 'Filters ({count})',
  },
  select: {
    id: 'app.containers.Admin.projects.project.manage.select',
    defaultMessage: 'Select',
  },
  doneSelecting: {
    id: 'app.containers.Admin.projects.project.manage.doneSelecting',
    defaultMessage: 'Done',
  },
  export: {
    id: 'app.containers.Admin.projects.project.manage.export',
    defaultMessage: 'Export',
  },
  anyStatus: {
    id: 'app.containers.Admin.projects.project.manage.anyStatus',
    defaultMessage: 'Any status',
  },
  anyTag: {
    id: 'app.containers.Admin.projects.project.manage.anyTag',
    defaultMessage: 'Any tag',
  },
  allPhases: {
    id: 'app.containers.Admin.projects.project.manage.allPhases',
    defaultMessage: 'Show ideas from all phases',
  },
  unassigned: {
    id: 'app.containers.Admin.projects.project.manage.unassigned',
    defaultMessage: 'Unassigned',
  },
  responded: {
    id: 'app.containers.Admin.projects.project.manage.responded',
    defaultMessage: 'Responded',
  },
  likes: {
    id: 'app.containers.Admin.projects.project.manage.likes',
    defaultMessage: 'Likes',
  },
  comments: {
    id: 'app.containers.Admin.projects.project.manage.comments',
    defaultMessage: 'Comments',
  },
  noIdeas: {
    id: 'app.containers.Admin.projects.project.manage.noIdeas',
    defaultMessage: 'No ideas match these filters.',
  },
  resetFilters: {
    id: 'app.containers.Admin.projects.project.manage.resetFilters',
    defaultMessage: 'Reset filters',
  },
  selectIdea: {
    id: 'app.containers.Admin.projects.project.manage.selectIdea',
    defaultMessage: 'Select {title}',
  },
  selectAll: {
    id: 'app.containers.Admin.projects.project.manage.selectAll',
    defaultMessage: 'Select all ideas on this page',
  },
  selectedCount: {
    id: 'app.containers.Admin.projects.project.manage.selectedCount',
    defaultMessage:
      '{count, plural, one {# idea selected} other {# ideas selected}}',
  },
  setStatus: {
    id: 'app.containers.Admin.projects.project.manage.setStatus',
    defaultMessage: 'Set status',
  },
  addTag: {
    id: 'app.containers.Admin.projects.project.manage.addTag',
    defaultMessage: '+ Add tag',
  },
  deleteSelected: {
    id: 'app.containers.Admin.projects.project.manage.deleteSelected',
    defaultMessage: 'Delete',
  },
  deleteSelectedConfirmation: {
    id: 'app.containers.Admin.projects.project.manage.deleteSelectedConfirmation',
    defaultMessage:
      '{count, plural, one {Delete this idea?} other {Delete these # ideas?}} This cannot be undone.',
  },
  tileIdeas: {
    id: 'app.containers.Admin.projects.project.manage.tileIdeas',
    defaultMessage: 'Ideas',
  },
  tileAwaitingReply: {
    id: 'app.containers.Admin.projects.project.manage.tileAwaitingReply',
    defaultMessage: 'Awaiting reply',
  },
  tileAwaitingReplyTooltip: {
    id: 'app.containers.Admin.projects.project.manage.tileAwaitingReplyTooltip',
    defaultMessage:
      'Ideas still in the first status with no official update. Click to show only these.',
  },
  tileResponded: {
    id: 'app.containers.Admin.projects.project.manage.tileResponded',
    defaultMessage: 'Responded',
  },
  tileAccepted: {
    id: 'app.containers.Admin.projects.project.manage.tileAccepted',
    defaultMessage: 'Accepted',
  },
  tileAcceptedTooltip: {
    id: 'app.containers.Admin.projects.project.manage.tileAcceptedTooltip',
    defaultMessage: 'Ideas marked Accepted or Implemented.',
  },
  answeredProgress: {
    id: 'app.containers.Admin.projects.project.manage.answeredProgress',
    defaultMessage: '{responded} of {total} answered',
  },
  awaitingBannerTitle: {
    id: 'app.containers.Admin.projects.project.manage.awaitingBannerTitle',
    defaultMessage:
      '{count, plural, one {# idea is waiting for your reply} other {# ideas are waiting for your reply}}',
  },
  awaitingBannerBody: {
    id: 'app.containers.Admin.projects.project.manage.awaitingBannerBody',
    defaultMessage:
      'Replying early keeps residents engaged. Sort by most liked to start with the ideas people care about most.',
  },
  caughtUpTitle: {
    id: 'app.containers.Admin.projects.project.manage.caughtUpTitle',
    defaultMessage: 'All caught up',
  },
  caughtUpBody: {
    id: 'app.containers.Admin.projects.project.manage.caughtUpBody',
    defaultMessage:
      "Every idea has a reply. Residents can see you're listening.",
  },
  import: {
    id: 'app.containers.Admin.projects.project.manage.import',
    defaultMessage: 'Import',
  },
  aiSummaryTitle: {
    id: 'app.containers.Admin.projects.project.manage.aiSummaryTitle',
    defaultMessage: 'AI summary',
  },
  aiSummaryBody: {
    id: 'app.containers.Admin.projects.project.manage.aiSummaryBody',
    defaultMessage: 'Main themes across all ideas.',
  },
  status: {
    id: 'app.containers.Admin.projects.project.manage.status',
    defaultMessage: 'Status',
  },
  automaticStatus: {
    id: 'app.containers.Admin.projects.project.manage.automaticStatus',
    defaultMessage: 'This status is set automatically.',
  },
  assignee: {
    id: 'app.containers.Admin.projects.project.manage.assignee',
    defaultMessage: 'Assignee',
  },
  tags: {
    id: 'app.containers.Admin.projects.project.manage.tags',
    defaultMessage: 'Tags',
  },
  phases: {
    id: 'app.containers.Admin.projects.project.manage.phases',
    defaultMessage: 'Phases',
  },
  phasesHint: {
    id: 'app.containers.Admin.projects.project.manage.phasesHint',
    defaultMessage: 'Add the idea to another phase, or take it out of one.',
  },
  actions: {
    id: 'app.containers.Admin.projects.project.manage.actions',
    defaultMessage: 'Actions',
  },
  respond: {
    id: 'app.containers.Admin.projects.project.manage.respond',
    defaultMessage: 'Respond',
  },
  openFullView: {
    id: 'app.containers.Admin.projects.project.manage.openFullView',
    defaultMessage: 'Open full view',
  },
  openFullViewHint: {
    id: 'app.containers.Admin.projects.project.manage.openFullViewHint',
    defaultMessage: 'Comments, internal notes, edit the idea',
  },
  viewAsResident: {
    id: 'app.containers.Admin.projects.project.manage.viewAsResident',
    defaultMessage: 'View as a resident',
  },
  removeIdea: {
    id: 'app.containers.Admin.projects.project.manage.removeIdea',
    defaultMessage: 'Remove idea',
  },
  removeIdeaConfirmation: {
    id: 'app.containers.Admin.projects.project.manage.removeIdeaConfirmation',
    defaultMessage: 'Remove this idea? This cannot be undone.',
  },
});
