import { defineMessages } from 'react-intl';

export default defineMessages({
  phasesWidgetTitle: {
    id: 'app.components.ProjectPageBuilder.Widgets.phasesWidgetTitle',
    defaultMessage: 'Phases',
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
  inputFeedManagedNote: {
    id: 'app.components.ProjectPageBuilder.Widgets.inputFeedManagedNote',
    defaultMessage:
      "This shows the participation content for the active phase. Its content is set by the phase's method in the {projectEditorLink} — here you only choose where it sits on the page.",
  },
  onlyAdminsAndManagersSeeThis: {
    id: 'app.components.ProjectPageBuilder.Widgets.onlyAdminsAndManagersSeeThis',
    defaultMessage:
      'Only admins and project managers of this project can see this',
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
  sectionBackgroundLabel: {
    id: 'app.components.ProjectPageBuilder.Widgets.sectionBackgroundLabel',
    defaultMessage: 'Section background',
  },
  sectionBackgroundColored: {
    id: 'app.components.ProjectPageBuilder.Widgets.sectionBackgroundColored',
    defaultMessage: 'Colored',
  },
  sectionBackgroundWhite: {
    id: 'app.components.ProjectPageBuilder.Widgets.sectionBackgroundWhite',
    defaultMessage: 'White',
  },
  pastEventBadge: {
    id: 'app.components.ProjectPageBuilder.Widgets.pastEventBadge',
    defaultMessage: 'Past',
  },
  eventsEmptyMessage: {
    id: 'app.components.ProjectPageBuilder.Widgets.eventsEmptyMessage',
    defaultMessage:
      "No events yet — events added in the project editor appear here automatically. Visitors won't see this section until then.",
  },
  untitledProject: {
    id: 'app.components.ProjectPageBuilder.Widgets.untitledProject',
    defaultMessage: 'Untitled project',
  },
  sectionHeightCappedNote: {
    id: 'app.components.ProjectPageBuilder.Widgets.sectionHeightCappedNote',
    defaultMessage:
      'Shortened here to keep the page easy to arrange — the live page shows this section in full.',
  },
  extraSurveysWidgetTitle: {
    id: 'app.components.ProjectPageBuilder.Widgets.extraSurveysWidgetTitle',
    defaultMessage: 'Extra surveys',
  },
  extraSurveysManagedNote: {
    id: 'app.components.ProjectPageBuilder.Widgets.extraSurveysManagedNote',
    defaultMessage:
      'Only surveys under Extras can be linked. Add them in the {projectEditorLink}.',
  },
  extraSurveysSurveyLabel: {
    id: 'app.components.ProjectPageBuilder.Widgets.extraSurveysSurveyLabel',
    defaultMessage: 'Survey',
  },
  extraSurveysSelectPlaceholder: {
    id: 'app.components.ProjectPageBuilder.Widgets.extraSurveysSelectPlaceholder',
    defaultMessage: 'Select a survey…',
  },
  extraSurveysFormatLabel: {
    id: 'app.components.ProjectPageBuilder.Widgets.extraSurveysFormatLabel',
    defaultMessage: 'Survey button format',
  },
  extraSurveysFormatButton: {
    id: 'app.components.ProjectPageBuilder.Widgets.extraSurveysFormatButton',
    defaultMessage: 'Button',
  },
  extraSurveysFormatCard: {
    id: 'app.components.ProjectPageBuilder.Widgets.extraSurveysFormatCard',
    defaultMessage: 'Card view',
  },
  extraSurveysStyleLabel: {
    id: 'app.components.ProjectPageBuilder.Widgets.extraSurveysStyleLabel',
    defaultMessage: 'Button style',
  },
  extraSurveysStylePrimary: {
    id: 'app.components.ProjectPageBuilder.Widgets.extraSurveysStylePrimary',
    defaultMessage: 'Primary',
  },
  extraSurveysStyleSecondary: {
    id: 'app.components.ProjectPageBuilder.Widgets.extraSurveysStyleSecondary',
    defaultMessage: 'Secondary',
  },
  extraSurveysButtonTextLabel: {
    id: 'app.components.ProjectPageBuilder.Widgets.extraSurveysButtonTextLabel',
    defaultMessage: 'Button text',
  },
  extraSurveysDefaultButtonText: {
    id: 'app.components.ProjectPageBuilder.Widgets.extraSurveysDefaultButtonText',
    defaultMessage: 'Take the survey',
  },
  extraSurveysBadgeOpen: {
    id: 'app.components.ProjectPageBuilder.Widgets.extraSurveysBadgeOpen',
    defaultMessage: 'Open',
  },
  extraSurveysBadgeUpcoming: {
    id: 'app.components.ProjectPageBuilder.Widgets.extraSurveysBadgeUpcoming',
    defaultMessage: 'Upcoming',
  },
  extraSurveysBadgeClosed: {
    id: 'app.components.ProjectPageBuilder.Widgets.extraSurveysBadgeClosed',
    defaultMessage: 'Closed',
  },
  extraSurveysBadgeCompleted: {
    id: 'app.components.ProjectPageBuilder.Widgets.extraSurveysBadgeCompleted',
    defaultMessage: 'Completed',
  },
  extraSurveysBadgeRestricted: {
    id: 'app.components.ProjectPageBuilder.Widgets.extraSurveysBadgeRestricted',
    defaultMessage: 'Restricted',
  },
  extraSurveysOpensOn: {
    id: 'app.components.ProjectPageBuilder.Widgets.extraSurveysOpensOn',
    defaultMessage: 'Opens {date}',
  },
  extraSurveysClosedTimeAgo: {
    id: 'app.components.ProjectPageBuilder.Widgets.extraSurveysClosedTimeAgo',
    defaultMessage: 'Closed {timeAgo}',
  },
  extraSurveysClosed: {
    id: 'app.components.ProjectPageBuilder.Widgets.extraSurveysClosed',
    defaultMessage: 'Survey closed',
  },
  extraSurveysResponseReceived: {
    id: 'app.components.ProjectPageBuilder.Widgets.extraSurveysResponseReceived',
    defaultMessage: 'Thanks — your response was received',
  },
  extraSurveysNotEligible: {
    id: 'app.components.ProjectPageBuilder.Widgets.extraSurveysNotEligible',
    defaultMessage: "You're not eligible to take this survey",
  },
  extraSurveysNoSurveyTitle: {
    id: 'app.components.ProjectPageBuilder.Widgets.extraSurveysNoSurveyTitle',
    defaultMessage: 'No survey linked yet',
  },
  extraSurveysNoSurveyNote: {
    id: 'app.components.ProjectPageBuilder.Widgets.extraSurveysNoSurveyNote',
    defaultMessage:
      'Pick a survey in the settings panel to show it on the page.',
  },
});
