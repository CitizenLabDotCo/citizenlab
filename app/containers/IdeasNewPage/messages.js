/*
 * IdeasNewPage Messages
 *
 * This contains all the text for the IdeasNewPage component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  publish: {
    id: 'app.containers.IdeasNewPage.publish',
    defaultMessage: 'Publish',
  },
  saveAsDraft: {
    id: 'app.containers.IdeasNewPage.saveAsDraft',
    defaultMessage: 'Save as draft',
  },
  loading: {
    id: 'app.containers.IdeasNewPage.loading',
    defaultMessage: 'Loading existing draft...',
  },
  loadError: {
    id: 'app.containers.IdeasNewPage.loadError',
    defaultMessage: 'Can\'t load existing draft',
  },
  stored: {
    id: 'app.containers.IdeasNewPage.stored',
    defaultMessage: 'Draft saved',
  },
  storeError: {
    id: 'app.containers.IdeasNewPage.storeError',
    defaultMessage: 'Can\'t store updated draft',
  },
  submitting: {
    id: 'app.containers.IdeasNewPage.submitting',
    defaultMessage: 'Publishing...',
  },
  submitError: {
    id: 'app.containers.IdeasNewPage.submitError',
    defaultMessage: 'Can\'t publish',
  },
  submitted: {
    id: 'app.containers.IdeasNewPage.submitted',
    defaultMessage: 'Successfully published!',
  },
  shortTitleError: {
    id: 'app.containers.IdeasNewPage.shortTitleError',
    defaultMessage: 'Too short (min 5 chars)',
  },
  longTitleError: {
    id: 'app.containers.IdeasNewPage.longTitleError',
    defaultMessage: 'Too long (max 120 chars)',
  },
  charactersLeft: {
    id: 'app.containers.IdeasNewPage.charactersLeft',
    defaultMessage: '{charsLeft} characters left',
  },
  loadAttachmentsError: {
    id: 'app.containers.IdeasNewPage.loadAttachmentsError',
    defaultMessage: 'Coudln\'t laod existing attachments',
  },
  storeAttachmentError: {
    id: 'app.containers.IdeasNewPage.storeAttachmentError',
    defaultMessage: 'Coudln\'t upload attachment',
  },
  clickToUpload: {
    id: 'app.containers.IdeasNewPage.clickToUpload',
    defaultMessage: 'Click to upload',
  },
  loadImagesError: {
    id: 'app.containers.IdeasNewPage.loadImagesError',
    defaultMessage: 'Coudln\'t load existing images',
  },
  storeImageError: {
    id: 'app.containers.IdeasNewPage.storeImageError',
    defaultMessage: 'Coudln\'t upload image',
  },
});
