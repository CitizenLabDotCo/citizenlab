import { defineMessages } from 'react-intl';

export default defineMessages({
  comments: {
    id: 'app.containers.Admin.projects.project.analysis.Comments.comments',
    defaultMessage: 'Comments',
  },
  refresh: {
    id: 'app.containers.Admin.projects.project.analysis.Comments.refreshSummary',
    defaultMessage:
      '{count, plural, =0 {Refresh} =1 {1 new comment} other {# new comments}}',
  },
  aiSummary: {
    id: 'app.containers.Admin.projects.project.analysis.Comments.aiSummary',
    defaultMessage: 'AI Summary',
  },
  generateSummary: {
    id: 'app.containers.Admin.projects.project.analysis.Comments.generateSummary',
    defaultMessage: 'Summarize comments',
  },
  commentsSummaryVisibilityExplanation: {
    id: 'app.containers.Admin.projects.project.analysis.Comments.commentsSummaryVisibilityExplanation',
    defaultMessage:
      'Comment summary is available when there are 5 or more comments.',
  },
});
