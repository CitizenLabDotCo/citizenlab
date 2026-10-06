import { defineMessages } from 'react-intl';

export default defineMessages({
  moveToTimeline: {
    id: 'app.containers.Admin.projects.PhasePlacement.moveToTimeline',
    defaultMessage: 'Move to timeline',
  },
  moveToSpotlightSurveys: {
    id: 'app.containers.Admin.projects.PhasePlacement.moveToSpotlightSurveys',
    defaultMessage: 'Move to spotlight surveys',
  },
  moveToTimelineTitle: {
    id: 'app.containers.Admin.projects.PhasePlacement.moveToTimelineTitle',
    defaultMessage: 'Move this survey to the timeline?',
  },
  moveToSpotlightSurveysTitle: {
    id: 'app.containers.Admin.projects.PhasePlacement.moveToSpotlightSurveysTitle',
    defaultMessage: 'Make this a spotlight survey?',
  },
  moveToTimelineExplanation: {
    id: 'app.containers.Admin.projects.PhasePlacement.moveToTimelineExplanation',
    defaultMessage:
      'The survey becomes a phase on the timeline. It keeps its questions and responses, and its survey link keeps working.',
  },
  moveToSpotlightSurveysExplanation: {
    id: 'app.containers.Admin.projects.PhasePlacement.moveToSpotlightSurveysExplanation',
    defaultMessage:
      'The survey runs alongside the timeline. It keeps its questions and responses, and its survey link keeps working.',
  },
  overlapBlocker: {
    id: 'app.containers.Admin.projects.PhasePlacement.overlapBlocker',
    defaultMessage:
      '"{phaseName}" runs at the same time as this survey. Phases on the timeline cannot overlap.',
  },
  openEndedBlocker: {
    id: 'app.containers.Admin.projects.PhasePlacement.openEndedBlocker',
    defaultMessage:
      'This survey has no end date. Only the last phase on the timeline can be open-ended.',
  },
  changeDatesHint: {
    id: 'app.containers.Admin.projects.PhasePlacement.changeDatesHint',
    defaultMessage: 'Change the survey dates, then try again.',
  },
  changeDatesButton: {
    id: 'app.containers.Admin.projects.PhasePlacement.changeDatesButton',
    defaultMessage: 'Change the dates',
  },
  widgetRemoved: {
    id: 'app.containers.AdminPage.ProjectTimeline.moveWarningWidgetRemoved',
    defaultMessage:
      'The survey is shown in a block on your project page. That block will be removed.',
  },
  previousPhaseEnds: {
    id: 'app.containers.AdminPage.ProjectTimeline.moveWarningPreviousPhaseEnds',
    defaultMessage:
      '"{phaseName}" has no end date. It will end on {date}, when this survey starts.',
  },
  laterPhasesRenumbered: {
    id: 'app.containers.Admin.projects.PhasePlacement.laterPhasesRenumbered',
    defaultMessage:
      'The phases after this survey get a new number in their link, so links you shared to them will stop working.',
  },
  timelinePageRemoved: {
    id: 'app.containers.Admin.projects.PhasePlacement.timelinePageRemoved',
    defaultMessage:
      'The survey no longer has a page on the timeline, so links you shared to that page will stop working.',
  },
  timelineGap: {
    id: 'app.containers.Admin.projects.PhasePlacement.timelineGap',
    defaultMessage: 'The timeline will have no phase from {from} to {to}.',
  },
  newLastPhase: {
    id: 'app.containers.Admin.projects.PhasePlacement.newLastPhase',
    defaultMessage:
      '"{phaseName}" becomes the last phase on the timeline. It ends on {date}.',
  },
  endedSurveyHidden: {
    id: 'app.containers.Admin.projects.PhasePlacement.endedSurveyHidden',
    defaultMessage:
      'This survey has ended. Residents only see an ended spotlight survey if you add it to your project page.',
  },
  previousPhaseError: {
    id: 'app.containers.AdminPage.ProjectTimeline.movePreviousPhaseError',
    defaultMessage:
      'The phase before this survey has no end date, and it cannot end on the start date of this survey. Change the dates and try again.',
  },
  confirmButton: {
    id: 'app.containers.AdminPage.ProjectTimeline.moveConfirmButton',
    defaultMessage: 'Move the survey',
  },
  cancelButton: {
    id: 'app.containers.AdminPage.ProjectTimeline.moveCancelButton',
    defaultMessage: 'Cancel',
  },
});
