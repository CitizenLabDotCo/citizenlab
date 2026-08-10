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
  endDate: {
    id: 'app.containers.Admin.projects.all.new.Timeline.ProjectGanttChart.endDate',
    defaultMessage: 'End date: {date}',
  },
  activePhasesTitle: {
    id: 'app.containers.Admin.projects.all.new.Timeline.ProjectGanttChart.activePhasesTitle',
    defaultMessage: 'Active phases:',
  },
  activePhaseListItem: {
    id: 'app.containers.Admin.projects.all.new.Timeline.ProjectGanttChart.activePhaseListItem',
    defaultMessage: '{phaseName} ({participationMethod})',
  },
  phaseListTitle: {
    id: 'app.containers.Admin.projects.all.new.Timeline.ProjectGanttChart.phaseListTitle',
    defaultMessage: 'Phases:',
  },
  phaseListItem: {
    id: 'app.containers.Admin.projects.all.new.Timeline.ProjectGanttChart.phaseListItem',
    defaultMessage: 'Phase {number}: {phaseName} ({participationMethod})',
  },
  extraPhaseListItem: {
    id: 'app.containers.Admin.projects.all.new.Timeline.ProjectGanttChart.extraPhaseListItem',
    defaultMessage: 'Extra: {phaseName} ({participationMethod})',
  },
  noEndDate: {
    id: 'app.containers.Admin.projects.all.new.Timeline.ProjectGanttChart.noEndDate',
    defaultMessage: 'No end date',
  },
  noPhases: {
    id: 'app.containers.Admin.projects.all.new.Timeline.ProjectGanttChart.noPhases',
    defaultMessage: 'No phases',
  },
  noActivePhase: {
    id: 'app.containers.Admin.projects.all.new.Timeline.ProjectGanttChart.noActivePhase',
    defaultMessage: 'No active phase',
  },
});
