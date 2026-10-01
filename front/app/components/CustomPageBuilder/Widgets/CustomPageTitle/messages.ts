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
      'Title hidden. The page is still called "{title}" in the admin pages list and in the navigation bar.',
  },
  lockedNote: {
    id: 'app.components.CustomPageBuilder.Widgets.CustomPageTitle.lockedNote',
    defaultMessage:
      "The page always has a title, so this can't be removed. Hide it with the toggle above.",
  },
});
