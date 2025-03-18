import { defineMessages } from 'react-intl';

export default defineMessages({
  areasTitle: {
    id: 'front.app.containers.Admin.pagesAndMenu.containers.ContentBuilder.components.Widgets.Areas.areasTitle2',
    defaultMessage: 'In your area',
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
  followAreas: {
    id: 'front.app.containers.Admin.pagesAndMenu.containers.ContentBuilder.components.Widgets.Areas.followAreas',
    defaultMessage: 'Follow areas',
  },
  areasYouFollow: {
    id: 'front.app.containers.Admin.pagesAndMenu.containers.ContentBuilder.components.Widgets.Areas.areasYouFollow',
    defaultMessage: 'Areas you follow',
  },
  areaButtonsInfo: {
    id: 'front.app.containers.Admin.pagesAndMenu.containers.ContentBuilder.components.Widgets.Areas.areaButtonsInfo',
    defaultMessage:
      'Click on the buttons below to follow or unfollow the areas you would like to see projects for. The number of projects in each area is shown in brackets.',
  },
});
