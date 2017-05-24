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
});
