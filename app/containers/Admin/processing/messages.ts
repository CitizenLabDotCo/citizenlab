import { defineMessages } from 'react-intl';

export default defineMessages({
  tags: {
    id: 'app.containers.Admin.Processing.tags',
    defaultMessage: 'Tags',
  },
  title: {
    id: 'app.containers.Admin.Processing.title',
    defaultMessage: 'Title',
  },
  export: {
    id: 'app.containers.Admin.Processing.export',
    defaultMessage: 'Export',
  },
  project: {
    id: 'app.containers.Admin.Processing.project',
    defaultMessage: 'Project',
  },
  selectProject: {
    id: 'app.containers.Admin.Processing.selectProject',
    defaultMessage: 'Select project',
  },
  autotag: {
    id: 'app.containers.Admin.Processing.autotag',
    defaultMessage: 'Autotag',
  },
  cancel: {
    id: 'app.containers.Admin.Processing.cancel',
    defaultMessage: 'Cancel',
  },
  continue: {
    id: 'app.containers.Admin.Processing.continue',
    defaultMessage: 'Continue',
  },
  keyboardShortcuts: {
    id: 'app.containers.Admin.Processing.keyboardShortcuts',
    defaultMessage: 'Keyboard Shortcuts',
  },
  upAndDownArrow: {
    id: 'app.containers.Admin.Processing.upAndDownArrow',
    defaultMessage:
      'Up and down arrows allow you to highlight the previous or next item in the list',
  },
  returnKey: {
    id: 'app.containers.Admin.Processing.returnKey',
    defaultMessage:
      'The "Return" key opens the side panel where you can add remove tags from items',
  },
  escapeKey: {
    id: 'app.containers.Admin.Processing.escapeKey',
    defaultMessage:
      'The "Escape" key closes the side panel and brings you back to the full list',
  },
  autotagOverwriteAlert: {
    id: 'app.containers.Admin.Processing.autotagOverwriteAlert',
    defaultMessage:
      'This action may overwrite existing tags. Are you sure you want to continue?',
  },
  autotagOverwriteExplanation: {
    id: 'app.containers.Admin.Processing.autotagOverwriteExplanation',
    defaultMessage:
      'Auto-tagging items will overwrite any previously automatically-generated tags. Tags that have been approved or that were manually added will not be overwritten.',
  },
  tag: {
    id: 'app.containers.Admin.Processing.tag',
    defaultMessage: 'tag',
  },
  pleaseSelectAProject: {
    id: 'app.containers.Admin.Processing.pleaseSelectAProject',
    defaultMessage: 'please select a project',
  },
  automaticallyAssign: {
    id: 'app.containers.Admin.Processing.automaticallyAssign',
    defaultMessage: 'Automatically assign tags to selected items',
  },
  addNewTag: {
    id: 'app.containers.Admin.Processing.addNewTag',
    defaultMessage: 'Add new tag',
  },
  addExistingTag: {
    id: 'app.containers.Admin.Processing.addExistingTag',
    defaultMessage: 'Add existing tag',
  },
  suggestedTags: {
    id: 'app.containers.Admin.Processing.suggestedTags',
    defaultMessage: 'Suggested tags',
  },
  existingTags: {
    id: 'app.containers.Admin.Processing.existingTags',
    defaultMessage: 'Existing tags',
  },
  tagsToAssign: {
    id: 'app.containers.Admin.Processing.projectTags',
    defaultMessage: 'Project tags',
  },
  tagAssignationExplanation: {
    id: 'app.containers.Admin.Processing.tagAssignationExplanation',
    defaultMessage:
      'Tags you add here will be automatically assigned to relevant items based on our natural language processing technology.',
  },
  tagValidationErrorMessage: {
    id: 'app.containers.Admin.Processing.tagValidationErrorMessage',
    defaultMessage: 'please use max two words and do not add duplicates',
  },
  addSmartTag: {
    id: 'app.containers.Admin.Processing.addSmartTag',
    defaultMessage: 'Add smart tag',
  },
  approveAutoTags: {
    id: 'app.containers.Admin.Processing.approveAutoTags',
    defaultMessage: 'Approve auto-tags',
  },
  items: {
    id: 'app.containers.Admin.Processing.items',
    defaultMessage:
      '{selectedCount} {selectedCount, plural, =0 {item} one {item} other {items}} selected out of {totalCount}',
  },
  helpTooltipText: {
    id: 'app.containers.Admin.Processing.helpTooltipText',
    defaultMessage:
      'Did you know you can hit your keyboard up and down arrows to show and navigate through items content ?',
  },
  description: {
    id: 'app.containers.Admin.Processing.description',
    defaultMessage: 'Description',
  },
  proposedBudgetTitle: {
    id: 'app.containers.Admin.Processing.proposedBudgetTitle',
    defaultMessage: 'Proposed Budget',
  },
  addTag: {
    id: 'app.components.admin.PostManager.PostPreview.addTag',
    defaultMessage: 'Add a tag',
  },
  createTag: {
    id: 'app.components.admin.PostManager.PostPreview.createTag',
    defaultMessage: 'Create a tag',
  },
  suggestionLoading: {
    id: 'app.components.admin.PostManager.PostPreview.suggestionLoading',
    defaultMessage: "We're retrieving suggestions to tag the selected items",
  },
  noInputInThisProject: {
    id: 'app.components.admin.PostManager.PostPreview.noInputInThisProject',
    defaultMessage: "This project doesn't seem to contain any input.",
  },
  pickInputCollection: {
    id: 'app.components.admin.PostManager.PostPreview.pickInputCollection',
    defaultMessage: 'Please select an input collection project to start with.',
  },
  pendingTagText: {
    id: 'app.components.admin.PostManager.PostPreview.pendingTagText',
    defaultMessage: 'pending',
  },
  autotaggingProcessing: {
    id: 'app.components.admin.PostManager.PostPreview.autotaggingProcessing',
    defaultMessage:
      'Automatic tagging : {remainingItems} items are being processed',
  },
  noSuggestions: {
    id: 'app.components.admin.PostManager.PostPreview.noSuggestions',
    defaultMessage: 'No suggestions found.',
  },
});
