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
  thereAreCurrentlyNoProjectsSingular: {
    id: 'front.app.containers.Admin.pagesAndMenu.containers.ContentBuilder.components.Widgets.Areas.thereAreCurrentlyNoProjects',
    defaultMessage:
      'There are currently no projects in {areaName} that you have permission to view.',
  },
  thereAreCurrentlyNoProjectsPlural: {
    id: 'front.app.containers.Admin.pagesAndMenu.containers.ContentBuilder.components.Widgets.Areas.thereAreCurrentlyNoProjectsInYourAreas',
    defaultMessage:
      'There are currently no projects in the {areasTerm} that you follow that you have permission to view.',
  },
  areas: {
    id: 'front.app.containers.Admin.pagesAndMenu.containers.ContentBuilder.components.Widgets.Areas.areas',
    defaultMessage: 'Areas',
  },
  thisWidgetShows: {
    id: 'front.app.containers.Admin.pagesAndMenu.containers.ContentBuilder.components.Widgets.Areas.thisWidgetShows',
    defaultMessage:
      'This widget shows projects associated with the {areasTerm} the user follows. If the user does not follow any {areasTerm} yet, the widget will show the available {areasTerm} to follow. In this case the widget will show a maximum of 100 {areasTerm}.',
  },
});
