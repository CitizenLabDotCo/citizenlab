import {
  defineMessages
} from 'react-intl';

export default defineMessages({
  overviewPageTitle: {
    id: 'app.containers.AdminPage.ProjectDashboard.overviewPageTitle',
    defaultMessage: 'Projects',
  },
  overviewPageSubtitle: {
    id: 'app.containers.AdminPage.ProjectDashboard.overviewPageSubtitle',
    defaultMessage: 'Create as many projects as you want and edit them at any time. Drag and drop them to change the order in which you want to see them on your homepage.',
  },
  overviewPageSubtitleModerator: {
    id: 'app.containers.AdminPage.ProjectDashboard.overviewPageSubtitleModerator',
    defaultMessage: 'Here are the projects on the platform you are moderating.',
  },
  createAProject: {
    id: 'app.containers.AdminPage.ProjectEdit.createAProject',
    defaultMessage: 'Create a project',
  },
  fromATemplate: {
    id: 'app.containers.AdminPage.ProjectEdit.fromATemplate',
    defaultMessage: 'From a template',
  },
  fromScratch: {
    id: 'app.containers.AdminPage.ProjectEdit.fromScratch',
    defaultMessage: 'From scratch',
  },
  departments: {
    id: 'app.containers.AdminPage.ProjectEdit.departments',
    defaultMessage: 'Departments',
  },
  purposes: {
    id: 'app.containers.AdminPage.ProjectEdit.purposes',
    defaultMessage: 'Purposes',
  },
  participationLevels: {
    id: 'app.containers.AdminPage.ProjectEdit.participationLevels',
    defaultMessage: 'Participation levels',
  },
  searchPlaceholder: {
    id: 'app.containers.AdminPage.ProjectEdit.searchPlaceholder',
    defaultMessage: 'Search the templates',
  },
  useTemplate: {
    id: 'app.containers.AdminPage.ProjectEdit.useTemplate',
    defaultMessage: 'Use template',
  },
  moreDetails: {
    id: 'app.containers.AdminPage.ProjectEdit.moreDetails',
    defaultMessage: 'More details',
  },
  loadMoreTemplates: {
    id: 'app.containers.AdminPage.ProjectEdit.loadMoreTemplates',
    defaultMessage: 'Load more templates',
  },
  xGroupsHaveAccess: {
    id: 'app.containers.AdminPage.ProjectEdit.xGroupsHaveAccess',
    defaultMessage: '{groupCount, plural, no {# groups can view} one {# group can view} other {# groups can view}}',
  },
  onlyAdminsCanView: {
    id: 'app.containers.AdminPage.ProjectEdit.onlyAdminsCanView',
    defaultMessage: 'Only admins can view',
  },
  editButtonLabel: {
    id: 'app.containers.AdminPage.ProjectEdit.editButtonLabel',
    defaultMessage: 'Edit',
  },
  published: {
    id: 'app.containers.AdminPage.ProjectEdit.published',
    defaultMessage: 'Published',
  },
  publishedTooltip: {
    id: 'app.containers.AdminPage.ProjectDashboard.publishedTooltip',
    defaultMessage: 'Published projects are currently active project which are shown on the platform.',
  },
  draft: {
    id: 'app.containers.AdminPage.ProjectEdit.draft',
    defaultMessage: 'Draft',
  },
  draftTooltip: {
    id: 'app.containers.AdminPage.ProjectDashboard.draftTooltip',
    defaultMessage: 'Draft projects are not shown on the platform. You can work on them with other admin and project moderators, until they are ready to be published.',
  },
  archived: {
  id: 'app.containers.AdminPage.ProjectEdit.archived',
    defaultMessage: 'Archived',
  },
  archivedTooltip: {
    id: 'app.containers.AdminPage.ProjectDashboard.archivedTooltip',
    defaultMessage: 'Archived projects are over but still shown on the platform. It is clearly indicated to users that they are archived and participation is no longer possible.',
  },
  manualSortingProjects: {
    id: 'app.containers.AdminPage.ProjectEdit.manualSortingProjects',
    defaultMessage: 'Manually sort projects',
  },
  noTemplatesFound: {
    id: 'app.containers.AdminPage.ProjectEdit.noTemplatesFound',
    defaultMessage: 'No templates found',
  }
});
