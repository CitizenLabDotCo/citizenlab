import { defineMessages } from 'react-intl';

export default defineMessages({
  titleEmptyError: {
    id: 'app.components.IdeaForm.titleEmptyError',
    defaultMessage: 'Please provide a title',
  },
  titleLengthError: {
    id: 'app.components.IdeaForm.titleLengthError',
    defaultMessage: 'The idea title must be at least 10 characters long',
  },
  descriptionEmptyError: {
    id: 'app.components.IdeaForm.descriptionEmptyError',
    defaultMessage: 'Please provide a description',
  },
  descriptionLengthError: {
    id: 'app.components.IdeaForm.descriptionLengthError',
    defaultMessage: 'The idea description must be at least 30 characters long',
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
    defaultMessage: 'Select an image for your idea.<br /> This will increase the visibility of your idea!',
  },
  imageDropzonePlaceholder: {
    id: 'app.container.IdeaForm.imageDropzonePlaceholder',
    defaultMessage: 'Drop your image here',
  },
  budgetLabel: {
    id: 'app.container.IdeaForm.budgetLabel',
    defaultMessage: 'Budget (in {currency}, max. {maxBudget})',
  },
  noBudgetError: {
    id: 'app.container.IdeaForm.noBudgetError',
    defaultMessage: 'Please provide a budget',
  },
  budgetIsZeroError: {
    id: 'app.container.IdeaForm.budgetIsZeroError',
    defaultMessage: 'Please provide a budget larger than 0',
  },
  budgetIsTooBig: {
    id: 'app.container.IdeaForm.budgetIsTooBig',
    defaultMessage: 'The provided budget is too big',
  },
  fileUploadLabel: {
    id: 'app.container.IdeaForm.fileUploadLabel',
    defaultMessage: 'Add files to your idea',
  }
});
