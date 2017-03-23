/*
 * SubmitIdeaPage Messages
 *
 * This contains all the text for the SubmitIdeaPage component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  publish: {
    id: 'app.containers.SubmitIdeaPage.publish',
    defaultMessage: 'Publish',
  },
  saveAsDraft: {
    id: 'app.containers.SubmitIdeaPage.saveAsDraft',
    defaultMessage: 'Save as draft',
  },
  loading: {
    id: 'app.containers.SubmitIdeaPage.loading',
    defaultMessage: 'Loading existing draft...',
  },
  loadError: {
    id: 'app.containers.SubmitIdeaPage.loadError',
    defaultMessage: 'Can\'t load existing draft',
  },
  stored: {
    id: 'app.containers.SubmitIdeaPage.stored',
    defaultMessage: 'Draft saved',
  },
  storeError: {
    id: 'app.containers.SubmitIdeaPage.storeError',
    defaultMessage: 'Can\'t store updated draft',
  },
  submitting: {
    id: 'app.containers.SubmitIdeaPage.submitting',
    defaultMessage: 'Publishing...',
  },
  submitError: {
    id: 'app.containers.SubmitIdeaPage.submitError',
    defaultMessage: 'Can\'t publish',
  },
  submitted: {
    id: 'app.containers.SubmitIdeaPage.submitted',
    defaultMessage: 'Successfully published!',
  },
});
