/*
 * ProjectsTimeline Messages
 *
 * This contains all the text for the ProjectsTimeline component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  pastPhase: {
    id: 'app.containers.ProjectsTimeline.pastPhase',
    defaultMessage: 'Past Phase',
  },
  currentPhase: {
    id: 'app.containers.ProjectsTimeline.currentPhase',
    defaultMessage: 'Current Phase',
  },
  comingPhase: {
    id: 'app.containers.ProjectsTimeline.comingPhase',
    defaultMessage: 'Coming Phase',
  },
  noTimeline: {
    id: 'app.containers.ProjectsTimeline.noTimeline',
    defaultMessage: 'Timeline is not available for this project',
  },
  error: {
    id: 'app.containers.ProjectsTimeline.error',
    defaultMessage: 'Timeline could not be loaded',
  },
});
