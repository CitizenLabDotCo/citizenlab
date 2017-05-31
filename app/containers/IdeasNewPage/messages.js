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
    defaultMessage: 'Success!',
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
    defaultMessage: '{charsLeft} characters left {optionLabel}',
  },
  storeImageError: {
    id: 'app.containers.IdeasNewPage.storeImageError',
    defaultMessage: 'Coudln\'t upload image',
  },
  storeAttachmentError: {
    id: 'app.containers.IdeasNewPage.storeAttachmentError',
    defaultMessage: 'Coudln\'t upload attachment',
  },
  clickToUpload: {
    id: 'app.containers.IdeasNewPage.clickToUpload',
    defaultMessage: 'Click to upload',
  },
  storeCommentError: {
    id: 'app.containers.IdeasNewPage.storeCommentError',
    defaultMessage: 'Can\'t publish comment',
  },
  submittingComment: {
    id: 'app.containers.IdeasNewPage.submittingComment',
    defaultMessage: 'Publishing...',
  },
  genericFile: {
    id: 'app.containers.IdeasNewPage.genericFile',
    defaultMessage: 'File',
  },
  topicsLabel: {
    id: 'app.containers.IdeasNewPage.topicsLabel',
    defaultMessage: 'topics',
  },
  topicsPlaceholder: {
    id: 'app.containers.IdeasNewPage.topicsPlaceholder',
    defaultMessage: 'Select topics',
  },
  areasLabel: {
    id: 'app.containers.IdeasNewPage.areasLabel',
    defaultMessage: 'areas',
  },
  areasPlaceholder: {
    id: 'app.containers.IdeasNewPage.areasPlaceholder',
    defaultMessage: 'Select projects',
  },
  projectsLabel: {
    id: 'app.containers.IdeasNewPage.projectsLabel',
    defaultMessage: 'projects',
  },
  projectsPlaceholder: {
    id: 'app.containers.IdeasNewPage.projectsPlaceholder',
    defaultMessage: 'Select areas',
  },
  loadingTopics: {
    id: 'app.containers.IdeasNewPage.loadingTopics',
    defaultMessage: 'Loading topics...',
  },
  loadTopicsError: {
    id: 'app.containers.IdeasNewPage.loadTopicsError',
    defaultMessage: 'Cannot load topic list',
  },
  loadingAreas: {
    id: 'app.containers.IdeasNewPage.loadingAreas',
    defaultMessage: 'Loading areas...',
  },
  loadAreasError: {
    id: 'app.containers.IdeasNewPage.loadAreasError',
    defaultMessage: 'Cannot load area list',
  },
  loadingProjects: {
    id: 'app.containers.IdeasNewPage.loadingProjects',
    defaultMessage: 'Loading projects...',
  },
  loadProjectsError: {
    id: 'app.containers.IdeasNewPage.loadProjectsError',
    defaultMessage: 'Cannot load project list',
  },
  invalidForm: {
    id: 'app.containers.IdeasNewPage.invalidForm',
    defaultMessage: 'Invalid form fields',
  },
  helmetTitle: {
    id: 'app.containers.IdeasNewPage.helmetTitle',
    defaultMessage: 'Publish idea page',
  },
  helmetDescription: {
    id: 'app.containers.IdeasNewPage.helmetDescription',
    defaultMessage: 'Publish a new idea',
  },
});
