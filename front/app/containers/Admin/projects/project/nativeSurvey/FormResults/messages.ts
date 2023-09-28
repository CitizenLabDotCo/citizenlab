import { defineMessages } from 'react-intl';

export default defineMessages({
  launchAnalysis: {
    id: 'app.containers.Admin.projects.project.survey.launchAnalysis',
    defaultMessage: 'Launch AI-powered analysis',
  },
  analysisSelectQuestions: {
    id: 'app.containers.Admin.projects.project.survey.analysisSelectQuestionsForAnalysis',
    defaultMessage: 'Select related questions for analysis',
  },
  analysisSelectQuestionsDescription: {
    id: 'app.containers.Admin.projects.project.survey.analysisSelectQuestionsSubtitle',
    defaultMessage:
      'Do you want to include any other related questions in your analysis of {question}?',
  },
  createAnalysis: {
    id: 'app.containers.Admin.projects.project.survey.createAnalysis',
    defaultMessage: 'Create analysis',
  },
  cancel: {
    id: 'app.containers.Admin.projects.project.survey.cancel',
    defaultMessage: 'Cancel',
  },
  viewAnalysis: {
    id: 'app.containers.Admin.projects.project.survey.viewAnalysis',
    defaultMessage: 'View',
  },
  deleteAnalysis: {
    id: 'app.containers.Admin.projects.project.survey.deleteAnalysis',
    defaultMessage: 'Delete',
  },
  deleteAnalysisConfirmation: {
    id: 'app.containers.Admin.projects.project.survey.deleteAnalysisConfirmation',
    defaultMessage:
      'Are you sure you want to delete this analysis? This action cannot be undone.',
  },
  consentModalTitle: {
    id: 'app.containers.Admin.projects.project.survey.consentModalTitle',
    defaultMessage: 'Before you continue',
  },
  consentModalText1: {
    id: 'app.containers.Admin.projects.project.survey.consentModalText1',
    defaultMessage:
      'By continuing you agree to the using OpenAI as a data processor for this project.',
  },
  consentModalText2: {
    id: 'app.containers.Admin.projects.project.survey.consentModalText2',
    defaultMessage:
      'The OpenAI APIs power the automated text summaries and parts of the automated tagging experience.',
  },
  consentModalText3: {
    id: 'app.containers.Admin.projects.project.survey.consentModalText3',
    defaultMessage:
      'We only send what users wrote in their surveys, ideas and comments to the OpenAI APIs, never any information from their profile.',
  },
  consentModalText4: {
    id: 'app.containers.Admin.projects.project.survey.consentModalText4',
    defaultMessage:
      'OpenAI will not use this data for further training of its models. More information on how OpenAI handles data privacy can be found { link }.',
  },
  consentModalText4LinkText: {
    id: 'app.containers.Admin.projects.project.survey.consentModalText4LinkText',
    defaultMessage: 'here',
  },
  consentModalText4Link: {
    id: 'app.containers.Admin.projects.project.survey.consentModalText4Link',
    defaultMessage: 'https://openai.com/api-data-privacy',
  },
  consentModalCheckbox: {
    id: 'app.containers.Admin.projects.project.survey.consentModalCheckbox',
    defaultMessage:
      'I agree to using OpenAI as a data processor for this project',
  },
  consentModalButton: {
    id: 'app.containers.Admin.projects.project.survey.consentModalButton',
    defaultMessage: 'Continue',
  },
  consentModalCancel: {
    id: 'app.containers.Admin.projects.project.survey.consentModalCancel',
    defaultMessage: 'Cancel',
  },
});
