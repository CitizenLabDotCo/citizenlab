import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.components.CustomPageBuilder.Widgets.CustomPageTitle.title',
    defaultMessage: 'Title',
  },
  titleLabel: {
    id: 'app.components.CustomPageBuilder.Widgets.CustomPageTitle.titleLabel',
    defaultMessage: 'Page title',
  },
  untitledPage: {
    id: 'app.components.CustomPageBuilder.Widgets.CustomPageTitle.untitledPage',
    defaultMessage: 'Untitled page',
  },
  showTitleLabel: {
    id: 'app.components.CustomPageBuilder.Widgets.CustomPageTitle.showTitleLabel',
    defaultMessage: 'Show the title on the page',
  },
  hiddenNote: {
    id: 'app.components.CustomPageBuilder.Widgets.CustomPageTitle.hiddenNote',
    defaultMessage:
      'Title hidden. The page is still called "{title}" — that name is used in the admin pages list and in the navigation bar.',
  },
  pinnedNote: {
    id: 'app.components.CustomPageBuilder.Widgets.CustomPageTitle.pinnedNote2',
    defaultMessage:
      "Pinned to the top of the page, and can't be moved or removed. Hide it with the toggle above.",
  },
  alsoRenamesPageNote: {
    id: 'app.components.CustomPageBuilder.Widgets.CustomPageTitle.alsoRenamesPageNote',
    defaultMessage:
      'This is the page name, so changing it also renames the page in the admin list and in any navigation bar item that uses it.',
  },
});
