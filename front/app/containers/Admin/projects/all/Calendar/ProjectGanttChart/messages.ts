import { defineMessages } from 'react-intl';

export default defineMessages({
  project: {
    id: 'app.containers.Admin.projects.all.new.Timeline.ProjectGanttChart.project',
    defaultMessage: 'Project',
  },
  folder: {
    id: 'app.containers.Admin.projects.all.new.Timeline.ProjectGanttChart.folder',
    defaultMessage: 'Folder: {folderName}',
  },
  startDate: {
    id: 'app.containers.Admin.projects.all.new.Timeline.ProjectGanttChart.startDate',
    defaultMessage: 'Start date: {date}',
  },
  currentPhase: {
    id: 'app.containers.Admin.projects.all.new.Timeline.ProjectGanttChart.currentPhase',
    defaultMessage: 'Current phase: {phaseName} ({participationMethod})',
  },
  daysLeft: {
    id: 'app.containers.Admin.projects.all.new.Timeline.ProjectGanttChart.daysLeft',
    defaultMessage: '{days} days left',
  },
  phaseListTitle: {
    id: 'app.containers.Admin.projects.all.new.Timeline.ProjectGanttChart.phaseListTitle',
    defaultMessage: 'Phases:',
  },
  phaseListItem: {
    id: 'app.containers.Admin.projects.all.new.Timeline.ProjectGanttChart.phaseListItem',
    defaultMessage: 'Phase {number}: {phaseName} ({participationMethod})',
  },
  noEndDate: {
    id: 'app.containers.Admin.projects.all.new.Timeline.ProjectGanttChart.noEndDate',
    defaultMessage: 'No end date',
  },
  noPhases: {
    id: 'app.containers.Admin.projects.all.new.Timeline.ProjectGanttChart.noPhases',
    defaultMessage: 'No phases',
  },
  noCurrentPhase: {
    id: 'app.containers.Admin.projects.all.new.Timeline.ProjectGanttChart.noCurrentPhase',
    defaultMessage: 'No current phase',
  },
});
