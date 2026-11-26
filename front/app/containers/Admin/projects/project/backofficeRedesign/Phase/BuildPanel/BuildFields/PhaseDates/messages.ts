import { defineMessages } from 'react-intl';

export default defineMessages({
  surveyDates: {
    id: 'app.containers.Admin.projects.project.surveyDates',
    defaultMessage: 'Survey dates',
  },
  notStarted: {
    id: 'app.containers.Admin.projects.project.dateStatusNotStarted',
    defaultMessage: 'Not started',
  },
  live: {
    id: 'app.containers.Admin.projects.project.dateStatusLive',
    defaultMessage: 'Live',
  },
  finished: {
    id: 'app.containers.Admin.projects.project.dateStatusFinished',
    defaultMessage: 'Finished',
  },
  startsToday: {
    id: 'app.containers.Admin.projects.project.dateStatusStartsToday',
    defaultMessage: 'Starts today',
  },
  startsIn: {
    id: 'app.containers.Admin.projects.project.dateStatusStartsIn',
    defaultMessage: '{days, plural, one {Starts in # day} other {Starts in # days}}',
  },
  endsToday: {
    id: 'app.containers.Admin.projects.project.dateStatusEndsToday',
    defaultMessage: 'Ends today',
  },
  daysLeft: {
    id: 'app.containers.Admin.projects.project.dateStatusDaysLeft',
    defaultMessage: '{days, plural, one {# day left} other {# days left}}',
  },
  openEnded: {
    id: 'app.containers.Admin.projects.project.dateStatusOpenEnded',
    defaultMessage: 'Open-ended',
  },
  endedToday: {
    id: 'app.containers.Admin.projects.project.dateStatusEndedToday',
    defaultMessage: 'today',
  },
  daysAgo: {
    id: 'app.containers.Admin.projects.project.dateStatusDaysAgo',
    defaultMessage: '{days, plural, one {# day ago} other {# days ago}}',
  },
});
