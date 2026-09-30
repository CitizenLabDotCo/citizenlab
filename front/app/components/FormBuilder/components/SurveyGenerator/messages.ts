import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.components.formBuilder.surveyGenerator.title',
    defaultMessage: 'Build with AI',
  },
  intro: {
    id: 'app.components.formBuilder.surveyGenerator.intro',
    defaultMessage:
      'Describe what you want to learn, or attach a document, and AI will build the survey for you.',
  },
  starterBikeLanes: {
    id: 'app.components.formBuilder.surveyGenerator.starterBikeLanes',
    defaultMessage:
      'A short survey on how residents feel about new protected bike lanes',
  },
  starterParkRedesign: {
    id: 'app.components.formBuilder.surveyGenerator.starterParkRedesign',
    defaultMessage:
      'Help us prioritise features for the redesign of our central park',
  },
  starterFromDocument: {
    id: 'app.components.formBuilder.surveyGenerator.starterFromDocument',
    defaultMessage: 'Turn the attached plan into a survey for residents',
  },
  placeholder: {
    id: 'app.components.formBuilder.surveyGenerator.placeholder',
    defaultMessage: 'Describe the survey you need…',
  },
  send: {
    id: 'app.components.formBuilder.surveyGenerator.send',
    defaultMessage: 'Generate',
  },
  attachFile: {
    id: 'app.components.formBuilder.surveyGenerator.attachFile',
    defaultMessage: 'Attach a file',
  },
  removeFile: {
    id: 'app.components.formBuilder.surveyGenerator.removeFile',
    defaultMessage: 'Remove {fileName}',
  },
  dropFiles: {
    id: 'app.components.formBuilder.surveyGenerator.dropFiles',
    defaultMessage: 'Drop PDF, Markdown or text files here',
  },
  filesNotice: {
    id: 'app.components.formBuilder.surveyGenerator.filesNotice',
    defaultMessage:
      "Attached files are added to this project's files and shared with AI.",
  },
  filesRejected: {
    id: 'app.components.formBuilder.surveyGenerator.filesRejected',
    defaultMessage:
      'Only PDF, Markdown (.md) and text (.txt) files of up to {maxSizeMb} MB can be attached, {maxFiles} at most.',
  },
  working: {
    id: 'app.components.formBuilder.surveyGenerator.working',
    defaultMessage: 'Generating your survey…',
  },
  elapsed: {
    id: 'app.components.formBuilder.surveyGenerator.elapsed',
    defaultMessage: '{seconds, plural, one {# second} other {# seconds}}',
  },
  succeeded: {
    id: 'app.components.formBuilder.surveyGenerator.succeeded',
    defaultMessage:
      'Your survey is ready and saved. Review the questions in the editor and adjust them where needed.',
  },
  failed: {
    id: 'app.components.formBuilder.surveyGenerator.failed',
    defaultMessage:
      'Something went wrong while generating the survey. Nothing changed. Please try again.',
  },
  hasResponses: {
    id: 'app.components.formBuilder.surveyGenerator.hasResponses',
    defaultMessage:
      'This survey already has responses, so it can no longer be generated with AI.',
  },
  projectNotDraft: {
    id: 'app.components.formBuilder.surveyGenerator.projectNotDraft',
    defaultMessage:
      'Surveys can only be generated with AI while the project is a draft.',
  },
  confirmTitle: {
    id: 'app.components.formBuilder.surveyGenerator.confirmTitle',
    defaultMessage: 'Replace the current survey?',
  },
  confirmText: {
    id: 'app.components.formBuilder.surveyGenerator.confirmText',
    defaultMessage:
      'The generated survey replaces all current questions and is saved immediately. Unsaved changes in the editor are lost.',
  },
  confirm: {
    id: 'app.components.formBuilder.surveyGenerator.confirm',
    defaultMessage: 'Replace and generate',
  },
  cancel: {
    id: 'app.components.formBuilder.surveyGenerator.cancel',
    defaultMessage: 'Cancel',
  },
  errorInProgress: {
    id: 'app.components.formBuilder.surveyGenerator.errorInProgress',
    defaultMessage: 'A survey is already being generated. Please wait.',
  },
  errorAiProcessingNotAllowed: {
    id: 'app.components.formBuilder.surveyGenerator.errorAiProcessingNotAllowed',
    defaultMessage: 'One of the files may not be shared with AI.',
  },
  errorUnsupportedFileType: {
    id: 'app.components.formBuilder.surveyGenerator.errorUnsupportedFileType',
    defaultMessage:
      'Only PDF, Markdown (.md) and text (.txt) files can be used.',
  },
  errorPromptTooLong: {
    id: 'app.components.formBuilder.surveyGenerator.errorPromptTooLong',
    defaultMessage: 'The description can be at most {count} characters long.',
  },
  errorUpload: {
    id: 'app.components.formBuilder.surveyGenerator.errorUpload',
    defaultMessage: '{fileName} could not be uploaded.',
  },
  errorGeneric: {
    id: 'app.components.formBuilder.surveyGenerator.errorGeneric',
    defaultMessage: 'The survey could not be generated. Please try again.',
  },
});
