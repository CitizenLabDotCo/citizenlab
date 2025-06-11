import { defineMessages } from 'react-intl';

export default defineMessages({
  project: {
    id: 'app.containers.Admin.projects.all.new.timeline.project',
    defaultMessage: 'Project',
  },
  daysLeft: {
    id: 'app.containers.Admin.projects.all.new.timeline.daysLeft',
    defaultMessage: '{count, plural, one {# day left} other {# days left}}',
  },
  failedToLoadTimelineError: {
    id: 'app.containers.Admin.projects.all.new.timeline.failedToLoadTimelineError',
    defaultMessage: 'Failed to load timeline.',
  },
});
