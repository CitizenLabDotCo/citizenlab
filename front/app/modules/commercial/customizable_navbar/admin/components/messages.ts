import { defineMessages } from 'react-intl';

export default defineMessages({
  tabNavigation: {
    id: 'app.modules.navbar.admin.components.tabNavigation',
    defaultMessage: 'Navigation',
  },
  policiesSubtitlePremium: {
    id: 'app.containers.AdminPage.PagesEdition.policiesSubtitlePremium1',
    defaultMessage:
      "Edit your platform's terms and conditions and privacy policy. Other pages, including the About and FAQ pages, can be edited in the {navigationLink} tab.",
  },
  linkToNavigation: {
    id: 'app.containers.AdminPage.PagesEdition.linkToNavigation',
    defaultMessage: 'Navigation',
  },
  navbarItemTitle: {
    id:
      'app.modules.commercial.customizable_navbar.admin.components.NavbarTitleField.navbarItemTitle',
    defaultMessage: 'Name in navbar',
  },
  emptyNavbarItemTitleError: {
    id:
      'app.modules.commercial.customizable_navbar.admin.components.NavbarTitleField.emptyNavbarItemTitleError',
    defaultMessage:
      "The 'Name in navbar' field is required. If your platform has multiple languages, check that all languages are filled in.",
  },
});
