import { defineMessages } from 'react-intl';

export default defineMessages({
  projects: {
    id: 'app.modules.commercial.analytics.admin.components.ProjectStatus.projects',
    defaultMessage: 'Projects',
  },
  totalProjects: {
    id: 'app.modules.commercial.analytics.admin.components.ProjectStatus.totalProjects',
    defaultMessage: 'Total projects',
  },
  totalProjectsToolTip: {
    id: 'app.modules.commercial.analytics.admin.components.ProjectStatus.totalProjectsToolTip',
    defaultMessage: 'The number of projects that are visible on the platform',
  },
  active: {
    id: 'app.modules.commercial.analytics.admin.components.ProjectStatus.active',
    defaultMessage: 'Active',
  },
  activeToolTip: {
    id: 'app.modules.commercial.analytics.admin.components.ProjectStatus.activeToolTip',
    defaultMessage:
      "Projects that are not archived and visible on the 'Active' table on the home page",
  },
  archived: {
    id: 'app.modules.commercial.analytics.admin.components.ProjectStatus.archived',
    defaultMessage: 'Archived',
  },
  finished: {
    id: 'app.modules.commercial.analytics.admin.components.ProjectStatus.finished',
    defaultMessage: 'Finished',
  },
  finishedToolTip: {
    id: 'app.modules.commercial.analytics.admin.components.ProjectStatus.finishedToolTip',
    defaultMessage:
      'All archived projects and active timeline projects that have finished are counted here',
  },
  draftProjects: {
    id: 'app.modules.commercial.analytics.admin.components.ProjectStatus.draftProjects',
    defaultMessage: 'Draft projects',
  },
});
