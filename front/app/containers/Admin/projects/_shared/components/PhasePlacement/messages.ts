import { defineMessages } from 'react-intl';

export default defineMessages({
  moveSaveChangesFirst: {
    id: 'app.containers.AdminPage.ProjectTimeline.moveSaveChangesFirst',
    defaultMessage: 'Save your changes before you move the survey.',
  },
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
  editTimelineDates: {
    id: 'app.containers.Admin.projects.PhasePlacement.editTimelineDates',
    defaultMessage:
      'Change the dates of this survey or another phase below. Nothing changes until you move the survey.',
  },
  invalidDates: {
    id: 'app.containers.Admin.projects.PhasePlacement.invalidDates',
    defaultMessage:
      '"{phaseName}" needs a start date and must last at least 24 hours. Timeline phases cannot overlap, and only the last phase can have no end date.',
  },
  surveyPlacement: {
    id: 'app.containers.Admin.projects.PhasePlacement.surveyPlacement',
    defaultMessage: 'Survey placement',
  },
  timeline: {
    id: 'app.containers.Admin.projects.PhasePlacement.timeline',
    defaultMessage: 'Timeline',
  },
  timelineDescription: {
    id: 'app.containers.Admin.projects.PhasePlacement.timelineDescription',
    defaultMessage: 'Appears on the timeline',
  },
  spotlight: {
    id: 'app.containers.Admin.projects.PhasePlacement.spotlight',
    defaultMessage: 'Spotlight',
  },
  spotlightDescription: {
    id: 'app.containers.Admin.projects.PhasePlacement.spotlightDescription',
    defaultMessage: 'Runs on its own, outside the timeline',
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
