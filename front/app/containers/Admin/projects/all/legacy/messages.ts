import { defineMessages } from 'react-intl';

export default defineMessages({
  overviewPageSubtitle: {
    id: 'app.containers.AdminPage.ProjectDashboard.overviewPageSubtitle',
    defaultMessage:
      'Create as many projects as you want and edit them at any time. Drag and drop them to change the order in which you want to see them on your homepage.',
  },
  published: {
    id: 'app.containers.AdminPage.ProjectDashboard.published',
    defaultMessage: 'Published',
  },
  draft: {
    id: 'app.containers.AdminPage.ProjectEdit.draft',
    defaultMessage: 'Draft',
  },
  archived: {
    id: 'app.containers.AdminPage.ProjectEdit.archived',
    defaultMessage: 'Archived',
  },
  pendingReview: {
    id: 'app.containers.AdminPage.ProjectEdit.pendingReview',
    defaultMessage: 'Pending approval',
  },
  approvedReview: {
    id: 'app.containers.AdminPage.ProjectEdit.approved',
    defaultMessage: 'Approved',
  },
  createAProjectFromATemplate: {
    id: 'app.containers.AdminPage.ProjectEdit.createAProjectFromATemplate',
    defaultMessage: 'Create a project from a template',
  },
  existingProjects: {
    id: 'app.containers.AdminPage.projects.all.existingProjects',
    defaultMessage: 'Existing projects',
  },
  projectsAndFolders: {
    id: 'app.containers.AdminPage.projects.all.projectsAndFolders',
    defaultMessage: 'Projects and folders',
  },
  all: {
    id: 'app.containers.AdminPage.projects.all.all',
    defaultMessage: 'All',
  },
  yourProjects: {
    id: 'app.containers.AdminPage.projects.all.yourProjects',
    defaultMessage: 'Your projects',
  },
  publishedTab: {
    id: 'app.containers.AdminPage.projects.all.publishedTab',
    defaultMessage: 'Published',
  },
  searchProjects: {
    id: 'app.containers.AdminPage.projects.all.searchProjects',
    defaultMessage: 'Search projects',
  },
  noProjectsFound: {
    id: 'app.containers.AdminPage.projects.all.noProjects',
    defaultMessage: 'No projects found.',
  },
  moderatedProjectsEmpty: {
    id: 'app.containers.AdminPage.projects.all.moderatedProjectsEmpty',
    defaultMessage:
      'Projects of which you are an assigned Project Manager will appear here.',
  },
  homepageWarning: {
    id: 'app.containers.AdminPage.projects.all.homepageWarning1',
    defaultMessage:
      'Use this page to set the order of projects in the "All projects" dropdown in the navigation bar. If you are using the "Published projects and folders" or "Projects and folders (legacy)" widgets on your homepage, the order of projects in these widget will also be determined by the order you set here.',
  },
});
