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
  title: {
    id: 'app.components.IdeaForm.title',
    defaultMessage: 'Title',
  },
  titlePlaceholder: {
    id: 'app.components.IdeaForm.titlePlaceholder',
    defaultMessage: 'Enter the title of your idea',
  },
  descriptionTitle: {
    id: 'app.components.IdeaForm.descriptionTitle',
    defaultMessage: 'Description',
  },
  descriptionPlaceholder: {
    id: 'app.components.IdeaForm.descriptionPlaceholder',
    defaultMessage: 'Enter the description of your idea',
  },
  topicsTitle: {
    id: 'app.components.IdeaForm.topicsTitle',
    defaultMessage: 'Topics',
  },
  locationTitle: {
    id: 'app.components.IdeaForm.locationTitle',
    defaultMessage: 'Location',
  },
  locationPlaceholder: {
    id: 'app.components.IdeaForm.locationPlaceholder',
    defaultMessage: 'Enter a location for your idea',
  },
  imageUploadTitle: {
    id: 'app.components.IdeaForm.imageUploadTitle',
    defaultMessage: 'Image',
  },
  imageUploadPlaceholder: {
    id: 'app.components.IdeaForm.imageUploadPlaceholder',
    defaultMessage: 'Select an image for your idea.<br /> This will increase the visibility of your idea!',
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
  fileAttachmentsTitle: {
    id: 'app.container.IdeaForm.fileAttachmentsTitle',
    defaultMessage: 'Attachments',
  },
  formGeneralSectionTitle: {
    id: 'app.components.IdeaForm.formGeneralSectionTitle',
    defaultMessage: 'What is your idea?',
  },
  formDetailsSectionTitle: {
    id: 'app.components.IdeaForm.formDetailsSectionTitle',
    defaultMessage: 'Details',
  },
  noTopicsError: {
    id: 'app.components.IdeaForm.noTopicsError',
    defaultMessage: 'Please select a topic',
  },
  noLocationError: {
    id: 'app.components.IdeaForm.noLocationError',
    defaultMessage: 'Please enter a location',
  },
  noImageError: {
    id: 'app.components.IdeaForm.noImageError',
    defaultMessage: 'Please add an image',
  },
  noAttachmentsError: {
    id: 'app.components.IdeaForm.noAttachmentsError',
    defaultMessage: 'Please add an attachment',
  },
  otherFilesTitle: {
    id: 'app.components.IdeaForm.otherFilesTitle',
    defaultMessage: 'Other files',
  }
});
