import { defineMessages } from 'react-intl';

export default defineMessages({
  menuTitle: {
    id: 'app.containers.Admin.pagesAndMenu.containers.MenuTab.menuTitle',
    defaultMessage: 'Menu',
  },
  menuSubtitle: {
    id: 'app.containers.Admin.pagesAndMenu.containers.MenuTab.menuSubtitle',
    defaultMessage:
      'What appears in your site’s navigation bar. Home is locked — drag the rest to reorder.',
  },
  newMenuItem: {
    id: 'app.containers.Admin.pagesAndMenu.containers.MenuTab.newMenuItem',
    defaultMessage: 'New menu item',
  },
  navBarMaxItems: {
    id: 'app.containers.Admin.pagesAndMenu.containers.MenuTab.navBarMaxItems',
    defaultMessage: 'You can only add up to 6 items to the navigation bar',
  },
});
