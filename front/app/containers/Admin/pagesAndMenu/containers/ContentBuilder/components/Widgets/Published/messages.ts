import { defineMessages } from 'react-intl';

export default defineMessages({
  publishedTitle: {
    id: 'front.app.containers.Admin.pagesAndMenu.containers.ContentBuilder.components.Widgets.Published.publishedTitle',
    defaultMessage: 'Published projects and folders',
  },
  thisWidgetWillShow: {
    id: 'front.app.containers.Admin.pagesAndMenu.containers.ContentBuilder.components.Widgets.Published.thisWidgetWillShow',
    defaultMessage:
      'This widget will case the projects and folders that are currently published, respecting the ordering defined on the projects page. This behavior is the same as the "active" tab of the "legacy" projects widget.',
  },
  noData: {
    id: 'front.app.containers.Admin.pagesAndMenu.containers.ContentBuilder.components.Widgets.Published.noData',
    defaultMessage: 'No published projects or folders available',
  },
});
