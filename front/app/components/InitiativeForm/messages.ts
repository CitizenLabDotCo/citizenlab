import { defineMessages } from 'react-intl';

export default defineMessages({
  // Header Messages
  header: {
    id: 'app.containers.InitiativesNewPage.header',
    defaultMessage:
      'Start your own initiative and make your voice heard by {styledOrgName}',
  },
  orgName: {
    id: 'app.containers.InitiativesNewPage.orgName',
    defaultMessage: '{orgName}',
  },
  // Tips Box Messages
  tipsTitle: {
    id: 'app.containers.InitiativesNewPage.tipsTitle',
    defaultMessage: 'Tips and tricks for a successful initiative',
  },
  makeSureReadyToBePublic: {
    id: 'app.containers.InitiativesNewPage.makeSureReadyToBePublic',
    defaultMessage: 'Make sure the proposal is ready to be published.',
  },
  notEditableOnceReviewed: {
    id: 'app.containers.InitiativesNewPage.notEditableOnceReviewed',
    defaultMessage:
      "It won't be possible to edit it once it's reviewed and approved.",
  },
  notEditableOnceVoted: {
    id: 'app.containers.InitiativesNewPage.notEditableOnceVoted',
    defaultMessage:
      "It won't be possible to edit it once somebody votes for it.",
  },
  // Form Messages
  formGeneralSectionTitle: {
    id: 'app.components.InitiativeForm.formGeneralSectionTitle',
    defaultMessage: 'What is your initiative?',
  },
  titleEmptyError: {
    id: 'app.components.InitiativeForm.titleEmptyError',
    defaultMessage: 'Please provide a title',
  },
  titleMinLengthError: {
    id: 'app.components.InitiativeForm.titleMinLengthError',
    defaultMessage:
      'The provided title is too short. Please add a title that is between 10 and 72 characters long.',
  },
  titleLabel: {
    id: 'app.components.InitiativeForm.titleLabel',
    defaultMessage: 'Title',
  },
  titleLabelSubtext2: {
    id: 'app.components.InitiativeForm.titleLabelSubtext2',
    defaultMessage:
      'Choose a descriptive, yet concise title (min. 10 characters, max. 72 characters)',
  },
  descriptionLabel: {
    id: 'app.components.InitiativeForm.descriptionLabel',
    defaultMessage: 'What is your initiative about?',
  },
  descriptionLabelSubtext: {
    id: 'app.components.InitiativeForm.descriptionLabelSubtext',
    defaultMessage: 'Describe your initiative clearly (min. 500 characters)',
  },
  descriptionEmptyError: {
    id: 'app.components.InitiativeForm.descriptionEmptyError',
    defaultMessage: 'Please provide a description',
  },
  descriptionBodyLengthError: {
    id: 'app.components.InitiativeForm.descriptionBodyLengthError',
    defaultMessage:
      'The initiative description must be at least 30 characters long',
  },
  formDetailsSectionTitle: {
    id: 'app.components.InitiativeForm.formDetailsSectionTitle',
    defaultMessage: 'Details',
  },
  topicEmptyError: {
    id: 'app.components.InitiativeForm.topicEmptyError',
    defaultMessage: 'Please provide a topic',
  },
  cosponsorsEmptyError: {
    id: 'app.components.InitiativeForm.cosponsorsEmptyError',
    defaultMessage: 'Please add the required number of cosponsors',
  },
  cosponsorsMaxError: {
    id: 'app.components.InitiativeForm.cosponsorsMaxError',
    defaultMessage: 'You can only add {maxNumberOfCosponsors} cosponsors',
  },
  topicsLabel: {
    id: 'app.components.InitiativeForm.topicsLabel',
    defaultMessage: 'Select the topic of your initiative',
  },
  topicsLabelDescription: {
    id: 'app.components.InitiativeForm.topicsLabelDescription',
    defaultMessage: 'Select the topics that best cover your proposal.',
  },
  locationLabel: {
    id: 'app.components.InitiativeForm.locationLabel',
    defaultMessage: 'Select a Location',
  },
  locationLabelSubtext: {
    id: 'app.components.InitiativeForm.locationLabelSubtext',
    defaultMessage: 'Where is your initiative located?',
  },
  locationPlaceholder: {
    id: 'app.components.InitiativeForm.locationPlaceholder',
    defaultMessage: 'Type an address',
  },
  cosponsorSectionTitle: {
    id: 'app.components.InitiativeForm.cosponsorSectionTitle',
    defaultMessage: 'Cosponsors needed for review',
  },
  cosponsorSubtextBeforeInput: {
    id: 'app.components.InitiativeForm.cosponsorSubtextBeforeInput',
    defaultMessage:
      "It's required that you have at least {noOfCosponsorsText} on your proposal. Invite cosponsors through the field below. The invited cosponsor(s) will receive an email.",
  },
  noOfCosponsorsText: {
    id: 'app.components.InitiativeForm.noOfCosponsorsText',
    defaultMessage:
      '{cosponsorsNumber, plural, one {1 cosponsor} other {# cosponsors}}',
  },
  cosponsorSubtextBeforeInputNote: {
    id: 'app.components.InitiativeForm.cosponsorSubtextBeforeInputNote',
    defaultMessage:
      "Your cosponsors need an account on this website before they'll appear in this list.",
  },
  formAttachmentsSectionTitle: {
    id: 'app.components.InitiativeForm.formAttachmentsSectionTitle',
    defaultMessage: 'Images and attachments',
  },
  bannerUploadLabel: {
    id: 'app.components.InitiativeForm.bannerUploadLabel',
    defaultMessage: 'Add a banner',
  },
  bannerUploadLabelSubtext: {
    id: 'app.components.InitiativeForm.bannerUploadLabelSubtext',
    defaultMessage:
      'This cover will be used at the top of your initiative page',
  },
  imageDropzonePlaceholder: {
    id: 'app.container.InitiativeForm.imageDropzonePlaceholder',
    defaultMessage: 'Drop your image here',
  },
  imageUploadLabel: {
    id: 'app.components.InitiativeForm.imageUploadLabel',
    defaultMessage: 'Add a main picture',
  },
  imageUploadLabelSubtext: {
    id: 'app.components.InitiativeForm.imageUploadLabelSubtext',
    defaultMessage: 'This image is shown on top of your initiative’s page',
  },
  imageEmptyError: {
    id: 'app.components.InitiativeForm.imageEmptyError',
    defaultMessage: 'Please provide an image',
  },
  fileUploadLabel: {
    id: 'app.container.InitiativeForm.fileUploadLabel',
    defaultMessage: 'Add files to your initiative',
  },
  fileUploadLabelSubtext: {
    id: 'app.container.InitiativeForm.fileUploadLabelSubtext',
    defaultMessage: 'Upload files to give others more information and context',
  },
  publishButton: {
    id: 'app.components.InitiativeForm.publishButton',
    defaultMessage: 'Publish your initiative',
  },
  submitButton: {
    id: 'app.components.InitiativeForm.submitButton',
    defaultMessage: 'Submit your proposal',
  },
  submitApiError: {
    id: 'app.components.InitiativeForm.submitApiError',
    defaultMessage:
      'There was an issue submitting the form. Please check for any errors and try again.',
  },
  profanityError: {
    id: 'app.components.InitiativeForm.profanityError',
    defaultMessage:
      'You may have used one or more words that are considered profanity by {guidelinesLink}. Please alter your text to remove any profanities that might be present.',
  },
  guidelinesLinkText: {
    id: 'app.components.InitiativeForm.guidelinesLinkText',
    defaultMessage: 'our guidelines',
  },
  buttonDisabled: {
    id: 'UI.FormComponents.buttonDisabled',
    defaultMessage: 'Submit button disabled',
  },
  buttonEnabled: {
    id: 'UI.FormComponents.buttonEnabled',
    defaultMessage: 'Submit button enabled',
  },
  cosponsorsPlaceholder: {
    id: 'app.components.InitiativeForm.cosponsorsPlaceholder',
    defaultMessage: 'Start typing a name to search',
  },
  cosponsorsLabel: {
    id: 'app.components.InitiativeForm.cosponsorsLabel',
    defaultMessage: 'Cosponsors',
  },
});
