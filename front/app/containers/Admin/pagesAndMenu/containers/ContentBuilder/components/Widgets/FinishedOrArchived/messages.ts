import { defineMessages } from 'react-intl';

export default defineMessages({
  finishedOrArchivedTitle: {
    id: 'app.containers.Admin.pagesAndMenu.ContentBuilder.Widgets.FinishedOrArchived.title',
    defaultMessage: 'Finished projects',
  },
  finished: {
    id: 'app.containers.Admin.pagesAndMenu.ContentBuilder.Widgets.FinishedOrArchived.finished',
    defaultMessage: 'Finished',
  },
  archived: {
    id: 'app.containers.Admin.pagesAndMenu.ContentBuilder.Widgets.FinishedOrArchived.archived',
    defaultMessage: 'Archived',
  },
  finishedAndArchived: {
    id: 'app.containers.Admin.pagesAndMenu.ContentBuilder.Widgets.FinishedOrArchived.finishedAndArchived',
    defaultMessage: 'Finished and archived',
  },
  thisWidgetShows: {
    id: 'app.containers.Admin.pagesAndMenu.ContentBuilder.Widgets.FinishedOrArchived.thisWidgetShows',
    defaultMessage:
      'This widget shows <b>projects that are finished and/or archived</b>. "Finished" also includes projects that are in the last phase, and where the last phase is a report.',
  },
  youSaidWeDid: {
    id: 'app.containers.Admin.pagesAndMenu.ContentBuilder.Widgets.FinishedOrArchived.youSaidWeDid',
    defaultMessage: 'You said, we did...',
  },
  noData: {
    id: 'app.containers.Admin.pagesAndMenu.ContentBuilder.Widgets.FinishedOrArchived.noData',
    defaultMessage:
      'This widget will only be shown to the user if there are finished or archived projects that they have permission to see. If you see this message, it means that there are no finished or archived projects that you (the admin) have permission to see. This message will not be visible on the real homepage.',
  },
  filterBy: {
    id: 'app.containers.Admin.pagesAndMenu.ContentBuilder.Widgets.FinishedOrArchived.filterBy',
    defaultMessage: 'Filter by',
  },
});
