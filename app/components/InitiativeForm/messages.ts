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
  elaborate: {
    id: 'app.containers.InitiativesNewPage.elaborate',
    defaultMessage:
      'Take the time to elaborate on your proposal. If necessary, type a draft first and then copy-paste it here. As soon as you post it, others will be able to read it and the time will start running.',
  },
  meaningfulTitle: {
    id: 'app.containers.InitiativesNewPage.meaningfulTitle',
    defaultMessage:
      'Choose a meaningful title that explains clearly what your proposal entails.',
  },
  visualise: {
    id: 'app.containers.InitiativesNewPage.visualise',
    defaultMessage:
      'Make sure to visualise your proposal with a fitting image, so that it stands out more.',
  },
  relevantAttachments: {
    id: 'app.containers.InitiativesNewPage.relevantAttachments',
    defaultMessage:
      'Add relevant attachments, such as videos, inspiring examples, technical details or plans.',
  },
  shareSocialMedia: {
    id: 'app.containers.InitiativesNewPage.shareSocialMedia',
    defaultMessage:
      'Share your idea on social media and other channels to gather support from others.',
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
  titleMaxLengthError: {
    id: 'app.components.InitiativeForm.titleMaxLengthError',
    defaultMessage:
      'The provided title is too long. Please add a title that is between 10 and 72 characters long.',
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
  publishUnknownError: {
    id: 'app.components.InitiativeForm.publishUnknownError',
    defaultMessage:
      'There was an issue publishing your initiative, please try again later.',
  },
});
