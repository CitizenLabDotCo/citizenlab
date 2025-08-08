import { defineMessages } from 'react-intl';

export default defineMessages({
  homepageWarning: {
    id: 'app.containers.AdminPage.projects.all.homepageWarning1',
    defaultMessage:
      'Use this page to set the order of projects in the "All projects" dropdown in the navigation bar. If you are using the "Published projects and folders" or "Projects and folders (legacy)" widgets on your homepage, the order of projects in these widget will also be determined by the order you set here.',
  },
  noProjectsFound: {
    id: 'app.containers.AdminPage.projects.all.noProjects',
    defaultMessage: 'No projects found.',
  },
});
