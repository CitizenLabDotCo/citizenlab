/*
 * ProjectsTimeline Messages
 *
 * This contains all the text for the ProjectsTimeline component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  header: {
    id: 'app.containers.ProjectsTimeline.header',
    defaultMessage: 'Timeline',
  },
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
});
