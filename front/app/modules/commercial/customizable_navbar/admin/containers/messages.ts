import { defineMessages } from 'react-intl';

export default defineMessages({
  pageTitle: {
    id: 'app.modules.navbar.admin.containers.pageTitle',
    defaultMessage: 'Navigation bar and platform pages',
  },
  pageSubtitle: {
    id: 'app.modules.navbar.admin.containers.pageSubtitle',
    defaultMessage:
      'Your navigation bar can display up to five pages in addition to the Home and All projects pages. You can rename and reorder items and add new pages with your own content.',
  },
  navigationItems: {
    id: 'app.modules.navbar.admin.components.NavbarItemList.navigationItems',
    defaultMessage: 'Pages shown on your navigation bar',
  },
  hiddenFromNavigation: {
    id:
      'app.modules.navbar.admin.components.NavbarItemList.hiddenFromNavigation',
    defaultMessage: 'Other available pages',
  },
  deletePageConfirmationVisible: {
    id: 'app.modules.navbar.admin.containers.deletePageConfirmation',
    defaultMessage:
      'Are you sure you want to delete this page? This cannot be undone. You can also remove the page from the navigation bar if you aren’t ready to delete it yet.',
  },
  deletePageConfirmationHidden: {
    id: 'app.modules.navbar.admin.containers.deletePageConfirmationHidden',
    defaultMessage:
      'Are you sure you want to delete this page? This cannot be undone.',
  },
  addPageButton: {
    id: 'app.modules.navbar.admin.containers.addPageButton',
    defaultMessage: 'Add page',
  },
});
