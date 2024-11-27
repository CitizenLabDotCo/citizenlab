import { defineMessages } from 'react-intl';

export default defineMessages({
  headTitle: {
    id: 'app.containers.AccessibilityStatement.headTitle',
    defaultMessage: 'Accessibility Statement | {orgName}',
  },
  title: {
    id: 'app.containers.AccessibilityStatement.title',
    defaultMessage: 'Accessibility Statement',
  },
  pageDescription: {
    id: 'app.containers.AccessibilityStatement.pageDescription',
    defaultMessage: 'A statement on the accessibility of this website',
  },
  intro2022: {
    id: 'app.containers.AccessibilityStatement.intro2022',
    defaultMessage:
      '{citizenLabLink} is committed to providing a platform that is accessible to all users, regardless of technology or ability. Current relevant accessibility standards are adhered to in our on-going efforts to maximise the accessibility and usability of our platforms for all users.',
  },
  changePreferencesText: {
    id: 'app.containers.AccessibilityStatement.changePreferencesText',
    defaultMessage: 'At any time, {changePreferencesButton}.',
  },
  changePreferencesButtonText: {
    id: 'app.containers.AccessibilityStatement.changePreferencesButtonText',
    defaultMessage: 'you can change your preferences',
  },
  conformanceStatus: {
    id: 'app.containers.AccessibilityStatement.conformanceStatus',
    defaultMessage: 'Conformance status',
  },
  contentConformanceExceptions: {
    id: 'app.containers.AccessibilityStatement.contentConformanceExceptions',
    defaultMessage:
      'We strive to make our content inclusive for all. However, in some instances there may be inaccessible content on the platform as outlined below:',
  },
  exception_1: {
    id: 'app.containers.AccessibilityStatement.exception_1',
    defaultMessage:
      'Our digital engagement platforms facilitate user-generated content posted by individuals and organisations. It is possible that PDFs, images or other file types including multi-media are uploaded to the platform as attachments or added into text fields by platform users. These documents may not be fully accessible.',
  },
  onlineWorkshopsException: {
    id: 'app.containers.AccessibilityStatement.onlineWorkshopsException',
    defaultMessage:
      'Our online workshops have a live video streaming component, which does not currently support subtitles.',
  },
  technologiesTitle: {
    id: 'app.containers.AccessibilityStatement.technologiesTitle',
    defaultMessage: 'Technologies',
  },
  technologiesIntro: {
    id: 'app.containers.AccessibilityStatement.technologiesIntro',
    defaultMessage:
      'The accessibility of this site relies on the following technologies to work:',
  },
  assesmentMethodsTitle: {
    id: 'app.containers.AccessibilityStatement.assesmentMethodsTitle',
    defaultMessage: 'Assessment method',
  },
  assesmentText2022: {
    id: 'app.containers.AccessibilityStatement.assesmentText2022',
    defaultMessage:
      'The accessibility of this site was evaluated by an external entity not involved in the design and development process. The compliance of the forementioned {demoPlatformLink} can be identified on this {statusPageLink}.',
  },
  statusPageText: {
    id: 'app.containers.AccessibilityStatement.statusPageText',
    defaultMessage: 'status page',
  },
  feedbackProcessTitle: {
    id: 'app.containers.AccessibilityStatement.feedbackProcessTitle',
    defaultMessage: 'Feedback process',
  },
  feedbackProcessIntro: {
    id: 'app.containers.AccessibilityStatement.feedbackProcessIntro',
    defaultMessage:
      'We welcome your feedback on the accessibility of this site. Please contact us via one of the following methods:',
  },
  email: {
    id: 'app.containers.AccessibilityStatement.email',
    defaultMessage: 'Email:',
  },
  postalAddress: {
    id: 'app.containers.AccessibilityStatement.postalAddress',
    defaultMessage: 'Postal address:',
  },
  govocalAddress2022: {
    id: 'app.containers.AccessibilityStatement.govocalAddress2022',
    defaultMessage: 'Boulevard Pachéco 34, 1000 Brussels, Belgium',
  },
  responsiveness: {
    id: 'app.containers.AccessibilityStatement.responsiveness',
    defaultMessage: 'We aim to respond to feedback within 1-2 business days.',
  },
  publicationDate: {
    id: 'app.containers.AccessibilityStatement.publicationDate',
    defaultMessage: 'Publication date',
  },
  publicationDate2024: {
    id: 'app.containers.AccessibilityStatement.publicationDate2024',
    defaultMessage:
      'This accessibility statement was published on August 21, 2024.',
  },
  applicability: {
    id: 'app.containers.AccessibilityStatement.applicability',
    defaultMessage:
      'This accessibility statement applies to a {demoPlatformLink} that is representative of this website; it uses the same source code and has the same functionality.',
  },
  demoPlatformLinkText: {
    id: 'app.containers.AccessibilityStatement.demoPlatformLinkText',
    defaultMessage: 'demo website',
  },
  conformanceExceptions: {
    id: 'app.containers.AccessibilityStatement.conformanceExceptions',
    defaultMessage: 'Conformance exceptions',
  },
  userGeneratedContent: {
    id: 'app.containers.AccessibilityStatement.userGeneratedContent',
    defaultMessage: 'User-generated content ',
  },
  workshops: {
    id: 'app.containers.AccessibilityStatement.workshops',
    defaultMessage: 'Workshops',
  },
  embeddedSurveyTools: {
    id: 'app.containers.AccessibilityStatement.embeddedSurveyTools',
    defaultMessage: 'Embedded survey tools',
  },
  embeddedSurveyToolsException: {
    id: 'app.containers.AccessibilityStatement.embeddedSurveyToolsException',
    defaultMessage:
      'The embedded survey tools that are available for use on this platform are third-party software and may not be accessible.',
  },
  mapping: {
    id: 'app.containers.AccessibilityStatement.mapping',
    defaultMessage: 'Mapping',
  },
  mapping_1: {
    id: 'app.containers.AccessibilityStatement.mapping_1',
    defaultMessage:
      'Maps on the platform partially meet accessibility standards. Map extent, zoom, and UI widgets can be controlled using a keyboard when viewing maps. Admins can also configure the style of map layers in the back office, or using the Esri integration, to create more accessible colour palettes and symbology. Using different line or polygon styles (e.g. dashed lines) will also help differentiate map layers wherever possible, and although such styling cannot be configured within our platform at this time, it can be configured if using maps with the Esri integration.',
  },
  mapping_2: {
    id: 'app.containers.AccessibilityStatement.mapping_2',
    defaultMessage:
      'Maps in the platform are not fully accessible as they do not audibly present basemaps, map layers, or trends in the data to users utilizing screen readers. Fully accessible maps would need to audibly present the map layers and describe any relevant trends in the data. Furthermore, line and polygon map drawing in surveys is not accessible as shapes cannot be drawn using a keyboard. Alternative input methods are not available at this time due to technical complexity.',
  },
  mapping_3: {
    id: 'app.containers.AccessibilityStatement.mapping_3',
    defaultMessage:
      'To make line and polygon map drawing more accessible, we recommend including an introduction or explanation in the survey question or page description of what the map is showing and any relevant trends. Furthermore, a short or long answer text question could be provided so respondents can describe their answer in plain terms if needed (rather than clicking on the map). We also recommend including contact information for the project manager so respondents who cannot fill in a map question can request an alternative method to answer the question (E.g. Video meeting).',
  },
  mapping_4: {
    id: 'app.containers.AccessibilityStatement.mapping_4',
    defaultMessage:
      'For Ideation projects and proposals, there is an option to display inputs in a map view, which is not accessible. However, for these methods there is an alternative list view of inputs available, which is accessible.',
  },
});
