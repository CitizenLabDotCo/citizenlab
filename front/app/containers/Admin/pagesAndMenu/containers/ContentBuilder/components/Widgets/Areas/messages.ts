import { defineMessages } from 'react-intl';

export default defineMessages({
  areasTitle: {
    id: 'front.app.containers.Admin.pagesAndMenu.containers.ContentBuilder.components.Widgets.Areas.areasTitle2',
    defaultMessage: 'In your area',
  },
  selectYourX: {
    id: 'front.app.containers.Admin.pagesAndMenu.containers.ContentBuilder.components.Widgets.Areas.selectYourX',
    defaultMessage: 'Select your {areaTerm}',
  },
  noData: {
    id: 'front.app.containers.Admin.pagesAndMenu.containers.ContentBuilder.components.Widgets.Areas.noData',
    defaultMessage:
      'This widget will only be shown to the user if there are projects associated with areas that they follow. If you see this message, it means that the areas that you (the admin) are following have no associated projects. This message will not be visible on the real homepage.',
  },
});
