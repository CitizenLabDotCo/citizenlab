/*
 * IdeasShow Messages
 *
 * This contains all the text for the IdeasShow component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  loadingProject: {
    id: 'app.containers.IdeasShow.loadingProject',
    defaultMessage: 'Loading project...',
  },
  projectNotFound: {
    id: 'app.containers.IdeasShow.projectNotFound',
    defaultMessage: 'Ups... it seems that this project has be removed or forgotten!',
  },
  helmetTitle: {
    id: 'app.containers.IdeasShow.helmetTitle',
    defaultMessage: 'Idea show page',
  },
  helmetDescription: {
    id: 'app.containers.IdeasShow.helmetDescription',
    defaultMessage: 'Display an idea',
  },
});
