/*
 * ProjectsEvents Messages
 *
 * This contains all the text for the ProjectsEvents component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  noEvents: {
    id: 'app.containers.ProjectsEvents.noEvents',
    defaultMessage: 'No event available for this project',
  },
  loading: {
    id: 'app.containers.ProjectsEvents.loading',
    defaultMessage: 'Loading events ...',
  },
  error: {
    id: 'app.containers.ProjectsEvents.error',
    defaultMessage: 'Events could not be loaded',
  },
});
