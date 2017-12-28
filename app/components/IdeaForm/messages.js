import { defineMessages } from 'react-intl';

export default defineMessages({
  titleEmptyError: {
    id: 'app.components.IdeaForm.titleEmptyError',
    defaultMessage: 'Please provide a title',
  },
  descriptionEmptyError: {
    id: 'app.components.IdeaForm.descriptionEmptyError',
    defaultMessage: 'Please provide a description',
  },
  titleLabel: {
    id: 'app.components.IdeaForm.titleLabel',
    defaultMessage: 'Title (required)',
  },
  titlePlaceholder: {
    id: 'app.components.IdeaForm.titlePlaceholder',
    defaultMessage: 'Enter the title of your idea',
  },
  descriptionLabel: {
    id: 'app.components.IdeaForm.descriptionLabel',
    defaultMessage: 'Description (required)',
  },
  descriptionPlaceholder: {
    id: 'app.components.IdeaForm.descriptionPlaceholder',
    defaultMessage: 'Enter the description of your idea',
  },
  topicsLabel: {
    id: 'app.components.IdeaForm.topicsLabel',
    defaultMessage: 'Topics (optional, max. 2)',
  },
  topicsPlaceholder: {
    id: 'app.components.IdeaForm.topicsPlaceholder',
    defaultMessage: 'Select one or two topics for your idea',
  },
  projectsLabel: {
    id: 'app.components.IdeaForm.projectsLabel',
    defaultMessage: 'Project (optional)',
  },
  projectsPlaceholder: {
    id: 'app.components.IdeaForm.projectsPlaceholder',
    defaultMessage: 'Select a project to which your idea belongs',
  },
  locationLabel: {
    id: 'app.components.IdeaForm.locationLabel',
    defaultMessage: 'Location (optional)',
  },
  locationPlaceholder: {
    id: 'app.components.IdeaForm.locationPlaceholder',
    defaultMessage: 'Enter a location for your idea',
  },
  imageUploadLabel: {
    id: 'app.components.IdeaForm.imageUploadLabel',
    defaultMessage: 'Image (optional)',
  },
  imageUploadPlaceholder: {
    id: 'app.components.IdeaForm.imageUploadPlaceholder',
    defaultMessage: 'Select an image that represents your idea',
  },
});
