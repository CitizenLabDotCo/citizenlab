import { defineMessages } from 'react-intl';

export default defineMessages({
  timelineWidgetTitle: {
    id: 'app.components.ProjectPageBuilder.Widgets.timelineWidgetTitle',
    defaultMessage: 'Timeline',
  },
  eventsWidgetTitle: {
    id: 'app.components.ProjectPageBuilder.Widgets.eventsWidgetTitle',
    defaultMessage: 'Events',
  },
  phasesHeading: {
    id: 'app.components.ProjectPageBuilder.Widgets.phasesHeading',
    defaultMessage: 'Phases',
  },
  titleWidgetTitle: {
    id: 'app.components.ProjectPageBuilder.Widgets.titleWidgetTitle',
    defaultMessage: 'Title',
  },
  bannerWidgetTitle: {
    id: 'app.components.ProjectPageBuilder.Widgets.bannerWidgetTitle',
    defaultMessage: 'Project image',
  },
  projectTitleLabel: {
    id: 'app.components.ProjectPageBuilder.Widgets.projectTitleLabel',
    defaultMessage: 'Project title',
  },
  lockedHeaderNote: {
    id: 'app.components.ProjectPageBuilder.Widgets.lockedHeaderNote',
    defaultMessage:
      "Pinned to the top of the page — editable, but can't be moved or removed.",
  },
  eventsManagedNote: {
    id: 'app.components.ProjectPageBuilder.Widgets.eventsManagedNote',
    defaultMessage:
      "Events are managed in the project editor, under {eventsLink}. Add, edit, or remove them there — they'll appear here automatically.",
  },
  eventsLinkText: {
    id: 'app.components.ProjectPageBuilder.Widgets.eventsLinkText',
    defaultMessage: 'Events',
  },
  timelineManagedNote: {
    id: 'app.components.ProjectPageBuilder.Widgets.timelineManagedNote',
    defaultMessage:
      'Phases are set in the {projectEditorLink}. The timeline updates on its own as dates pass.',
  },
  projectEditorLinkText: {
    id: 'app.components.ProjectPageBuilder.Widgets.projectEditorLinkText',
    defaultMessage: 'project editor',
  },
});
