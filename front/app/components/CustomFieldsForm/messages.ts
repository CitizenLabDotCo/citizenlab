import { defineMessages } from 'react-intl';

export default defineMessages({
  titleRequired: {
    id: 'app.components.CustomFieldsForm.titleRequired',
    defaultMessage: 'The title is required',
  },

  descriptionRequired: {
    id: 'app.components.CustomFieldsForm.descriptionRequired',
    defaultMessage: 'The description is required',
  },

  fieldMinLength: {
    id: 'app.components.CustomFieldsForm.fieldMinLength',
    defaultMessage:
      'The field "{fieldName}" must be at least {min} characters long',
  },
  fieldMaxLength: {
    id: 'app.components.CustomFieldsForm.fieldMaxLength',
    defaultMessage:
      'The field "{fieldName}" must be at most {max} characters long',
  },
  imageRequired: {
    id: 'app.components.CustomFieldsForm.imageRequired',
    defaultMessage: 'The image is required',
  },
  fileRequired: {
    id: 'app.components.CustomFieldsForm.attachmentRequired',
    defaultMessage: 'At least one attachment is required',
  },
  topicRequired: {
    id: 'app.components.CustomFieldsForm.topicRequired',
    defaultMessage: 'At least one tag is required',
  },
  fieldRequired: {
    id: 'app.components.CustomFieldsForm.fieldRequired',
    defaultMessage: 'The field "{fieldName}" is required',
  },
  fieldMaximum: {
    id: 'app.components.CustomFieldsForm.fieldMaximumItems',
    defaultMessage:
      'At most {maxSelections, plural, one {# option} other {# options}} can be selected for the field "{fieldName}"',
  },
  fieldMinimum: {
    id: 'app.components.CustomFieldsForm.fieldMinimumItems',
    defaultMessage:
      'At least {minSelections, plural, one {# option} other {# options}} can be selected for the field "{fieldName}"',
  },
  progressBarLabel: {
    id: 'app.components.CustomFieldsForm.progressBarLabel',
    defaultMessage: 'Progress',
  },

  adminFieldTooltip: {
    id: 'app.components.CustomFieldsForm.adminFieldTooltip',
    defaultMessage: 'Field only visible to admins',
  },
  notPublic: {
    id: 'app.components.CustomFieldsForm.notPublic1',
    defaultMessage:
      '*This answer will only be shared with project managers, and not to the public.',
  },
  selectBetween: {
    id: 'app.components.CustomFieldsForm.selectBetween',
    defaultMessage: '*Select between { minItems } and { maxItems } options',
  },
  selectExactly: {
    id: 'app.components.CustomFieldsForm.selectExactly2',
    defaultMessage:
      '*Select exactly {selectExactly, plural, one {# option} other {# options}}',
  },
  selectAsManyAsYouLike: {
    id: 'app.components.CustomFieldsForm.selectAsManyAsYouLike',
    defaultMessage: '*Select as many as you like',
  },

  typeYourAnswer: {
    id: 'app.components.CustomFieldsForm.typeYourAnswer',
    defaultMessage: 'Type your answer',
  },
  typeYourAnswerRequired: {
    id: 'app.components.CustomFieldsForm.typeYourAnswerRequired',
    defaultMessage: 'It is required to type your answer',
  },
  authorFieldPlaceholder: {
    id: 'app.components.CustomFieldsForm.authorFieldPlaceholder',
    defaultMessage: 'Start typing to search by user email or name...',
  },
  authorFieldLabel: {
    id: 'app.components.CustomFieldsForm.authorFieldLabel',
    defaultMessage: 'Author',
  },
  budgetFieldLabel: {
    id: 'app.components.CustomFieldsForm.budgetFieldLabel',
    defaultMessage: 'Budget',
  },
  uploadShapefileInstructions: {
    id: 'app.components.CustomFieldsForm.uploadShapefileInstructions',
    defaultMessage: '* Upload a zip file containing one or more shapefiles.',
  },
  tapOnMapToAddOrType: {
    id: 'app.components.CustomFieldsForm.tapOnMapToAddOrType',
    defaultMessage:
      'Tap on the map or type an address below to add your answer.',
  },
  tapOnMapMultipleToAdd: {
    id: 'app.components.CustomFieldsForm.tapOnMapMultipleToAdd3',
    defaultMessage: 'Tap on the map to add your answer.',
  },
  tapOnFullscreenMapToAddPoint: {
    id: 'app.components.CustomFieldsForm.tapOnFullscreenMapToAddPoint',
    defaultMessage: 'Tap on the map to draw.',
  },
  tapOnFullscreenMapToAdd: {
    id: 'app.components.CustomFieldsForm.tapOnFullscreenMapToAdd4',
    defaultMessage:
      'Tap on the map to draw. Then, drag on points to move them.',
  },
  clickOnMapToAddOrType: {
    id: 'app.components.CustomFieldsForm.clickOnMapToAddOrType',
    defaultMessage:
      'Click on the map or type an address below to add your answer.',
  },
  clickOnMapMultipleToAdd: {
    id: 'app.components.CustomFieldsForm.clickOnMapMultipleToAdd3',
    defaultMessage:
      'Click on the map to draw. Then, drag on points to move them.',
  },

  addressInputAriaLabel: {
    id: 'app.components.CustomFieldsForm.addressInputAriaLabel',
    defaultMessage: 'Address input',
  },
  addressInputPlaceholder: {
    id: 'app.components.CustomFieldsForm.addressInputPlaceholder6',
    defaultMessage: 'Enter an address...',
  },
  tapToAddAPoint: {
    id: 'app.components.CustomFieldsForm.tapToAddAPoint',
    defaultMessage: 'Tap to add a point',
  },
  tapToAddALine: {
    id: 'app.components.CustomFieldsForm.tapToAddALine',
    defaultMessage: 'Tap to add a line',
  },
  tapToAddAnArea: {
    id: 'app.components.CustomFieldsForm.tapToAddAnArea',
    defaultMessage: 'Tap to add an area',
  },
  back: {
    id: 'app.components.CustomFieldsForm.back',
    defaultMessage: 'Back',
  },
  confirm: {
    id: 'app.components.CustomFieldsForm.confirm',
    defaultMessage: 'Confirm',
  },
  removeAnswer: {
    id: 'app.components.CustomFieldsForm.removeAnswer',
    defaultMessage: 'Remove answer',
  },
  atLeastTwoPointsRequired: {
    id: 'app.components.CustomFieldsForm.atLeastTwoPointsRequired',
    defaultMessage: 'At least two points are required for a line.',
  },
  atLeastThreePointsRequired: {
    id: 'app.components.CustomFieldsForm.atLeastThreePointsRequired',
    defaultMessage: 'At least three points are required for a polygon.',
  },

  otherArea: {
    id: 'app.components.CustomFieldsForm.otherArea',
    defaultMessage: 'Somewhere else',
  },
  blockedVerified: {
    id: 'app.components.CustomFieldsForm.blockedVerified',
    defaultMessage:
      "You can't edit this field because it contains verified information",
  },
  allStatementsError: {
    id: 'app.components.form.controls.allStatementsError',
    defaultMessage: 'An answer must be selected for all statements.',
  },

  submit: {
    id: 'app.components.form.submit',
    defaultMessage: 'Submit',
  },
  error: {
    id: 'app.components.form.error',
    defaultMessage: 'Error',
  },

  guidelinesLinkText: {
    id: 'app.components.form.ErrorDisplay.guidelinesLinkText',
    defaultMessage: 'our guidelines',
  },

  previous: {
    id: 'app.components.form.ErrorDisplay.previous',
    defaultMessage: 'Previous',
  },
  next: {
    id: 'app.components.form.ErrorDisplay.next',
    defaultMessage: 'Next',
  },
  save: {
    id: 'app.components.form.ErrorDisplay.save',
    defaultMessage: 'Save',
  },
  backToProject: {
    id: 'app.components.form.backToProject',
    defaultMessage: 'Back to project',
  },
  backToInputManager: {
    id: 'app.components.form.backToInputManager',
    defaultMessage: 'Back to input manager',
  },
  viewYourInput: {
    id: 'app.utils.IdeasNewPage.viewYourInput',
    defaultMessage: 'View your input',
  },
  viewYourIdea: {
    id: 'app.utils.IdeasNewPage.viewYourIdea',
    defaultMessage: 'View your idea',
  },
  viewYourOption: {
    id: 'app.utils.IdeasNewPage.viewYourOption',
    defaultMessage: 'View your option',
  },
  viewYourContribution: {
    id: 'app.utils.IdeasNewPage.viewYourContribution',
    defaultMessage: 'View your contribution',
  },
  viewYourProject: {
    id: 'app.utils.IdeasNewPage.viewYourProject',
    defaultMessage: 'View your project',
  },
  viewYourQuestion: {
    id: 'app.utils.IdeasNewPage.viewYourQuestion',
    defaultMessage: 'View your question',
  },

  viewYourProposal: {
    id: 'app.utils.IdeasNewPage.viewYourProposal',
    defaultMessage: 'View your proposal',
  },
  viewYourInitiative: {
    id: 'app.utils.IdeasNewPage.viewYourInitiative',
    defaultMessage: 'View your initiative',
  },
  viewYourPetition: {
    id: 'app.utils.IdeasNewPage.viewYourPetition',
    defaultMessage: 'View your petition',
  },
  viewYourIssue: {
    id: 'app.utils.IdeasNewPage.viewYourIssue',
    defaultMessage: 'View your issue',
  },
  valueOutOfTotalWithLabel: {
    id: 'app.components.form.controls.valueOutOfTotalWithLabel',
    defaultMessage: '{value} out of {total}, {label}',
  },
  valueOutOfTotalWithMaxExplanation: {
    id: 'app.components.form.controls.valueOutOfTotalWithMaxExplanation',
    defaultMessage: '{value} out of {total}, where {maxValue} is {maxLabel}',
  },
  valueOutOfTotal: {
    id: 'app.components.form.controls.valueOutOfTotal',
    defaultMessage: '{value} out of {total}',
  },
  cosponsorsPlaceholder: {
    id: 'app.components.form.controls.cosponsorsPlaceholder',
    defaultMessage: 'Start typing a name to search',
  },
  clearAll: {
    id: 'app.components.form.controls.clearAll',
    defaultMessage: 'Clear all',
  },
  clearAllScreenreader: {
    id: 'app.components.form.controls.clearAllScreenreader',
    defaultMessage: 'Clear all answers from above matrix question',
  },
  noRankSelected: {
    id: 'app.components.form.controls.noRankSelected',
    defaultMessage: 'No rank selected',
  },
  currentRank: {
    id: 'app.components.form.controls.currentRank',
    defaultMessage: 'Current rank: ',
  },
  rankingInstructions: {
    id: 'app.components.form.controls.rankingInstructions',
    defaultMessage: 'Drag and drop to rank options.',
  },

  birthyearTooHigh: {
    id: 'app.components.form.controls.birthyearTooHigh',
    defaultMessage: 'Birth year cannot be in the future',
  },
  birthyearTooLow: {
    id: 'app.components.form.controls.birthyearTooLow',
    defaultMessage: 'Birth year must be at least 1900',
  },
});
