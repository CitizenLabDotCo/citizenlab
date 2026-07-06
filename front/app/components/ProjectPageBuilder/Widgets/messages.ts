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
  inputFeedWidgetTitle2: {
    id: 'app.components.ProjectPageBuilder.Widgets.inputFeedWidgetTitle2',
    defaultMessage: 'Phase content',
  },
  inputFeedManagedNote: {
    id: 'app.components.ProjectPageBuilder.Widgets.inputFeedManagedNote',
    defaultMessage:
      "This shows the participation content for the active phase. Its content is set by the phase's method in the {projectEditorLink} — here you only choose where it sits on the page.",
  },
  onlyAdminsSeeThis: {
    id: 'app.components.ProjectPageBuilder.Widgets.onlyAdminsSeeThis',
    defaultMessage: 'Only admins and moderators of this project can see this',
  },
  bannerEmptyTitle: {
    id: 'app.components.ProjectPageBuilder.Widgets.bannerEmptyTitle',
    defaultMessage: 'Add a project image',
  },
  bannerEmptyNote: {
    id: 'app.components.ProjectPageBuilder.Widgets.bannerEmptyNote',
    defaultMessage:
      'No image yet · only admins and moderators of this project can see this',
  },
  inputFeedEmptyTitle: {
    id: 'app.components.ProjectPageBuilder.Widgets.inputFeedEmptyTitle',
    defaultMessage: 'No ways to take part yet',
  },
  timelineEmptyTitle: {
    id: 'app.components.ProjectPageBuilder.Widgets.timelineEmptyTitle',
    defaultMessage: 'No phases yet',
  },
  timelineHiddenTitle: {
    id: 'app.components.ProjectPageBuilder.Widgets.timelineHiddenTitle',
    defaultMessage: 'Timeline hidden',
  },
  timelineHiddenNote: {
    id: 'app.components.ProjectPageBuilder.Widgets.timelineHiddenNote',
    defaultMessage:
      "This project has a single phase without an end date or description, so visitors won't see a timeline.",
  },
  eventsEmptyNote: {
    id: 'app.components.ProjectPageBuilder.Widgets.eventsEmptyNote',
    defaultMessage:
      "No events yet — events added in the project editor appear here automatically. Citizens won't see this section until then.",
  },
  untitledProject: {
    id: 'app.components.ProjectPageBuilder.Widgets.untitledProject',
    defaultMessage: 'Untitled project',
  },
  descriptionSectionTitle: {
    id: 'app.components.ProjectPageBuilder.Widgets.descriptionSectionTitle',
    defaultMessage: 'Description',
  },
  descriptionSectionNote: {
    id: 'app.components.ProjectPageBuilder.Widgets.descriptionSectionNote',
    defaultMessage:
      'The project description. Edit its content by adding elements from the toolbox. It stays pinned in this position for now.',
  },
});
