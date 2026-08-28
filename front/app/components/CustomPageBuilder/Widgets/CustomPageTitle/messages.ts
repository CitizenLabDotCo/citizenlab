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
  pinnedNote: {
    id: 'app.components.CustomPageBuilder.Widgets.CustomPageTitle.pinnedNote',
    defaultMessage:
      "Pinned to the top of the page — editable and removable, but can't be moved.",
  },
  alsoRenamesPageNote: {
    id: 'app.components.CustomPageBuilder.Widgets.CustomPageTitle.alsoRenamesPageNote',
    defaultMessage:
      'This is the page name, so changing it also renames the page in the admin list and in any navigation bar item that uses it.',
  },
});
