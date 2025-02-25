import { defineMessages } from 'react-intl';

export default defineMessages({
  comments: {
    id: 'app.containers.Admin.projects.project.analysis.Comments.comments',
    defaultMessage: 'Comments',
  },
  refresh: {
    id: 'app.containers.Admin.projects.project.analysis.Comments.refresh',
    defaultMessage:
      '{count, plural, =0 {No new comments} =1 {1 new comment} other {# new comments}}',
  },
  aiSummary: {
    id: 'app.containers.Admin.projects.project.analysis.Comments.aiSummary',
    defaultMessage: 'AI Summary',
  },
  generateSummary: {
    id: 'app.containers.Admin.projects.project.analysis.Comments.generateSummary',
    defaultMessage: 'Summarize comments',
  },
});
