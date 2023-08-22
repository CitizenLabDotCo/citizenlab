import { defineMessages } from 'react-intl';

export default defineMessages({
  analysisSubtitle: {
    id: 'app.containers.Admin.projects.project.ideas.analysisText',
    defaultMessage:
      'Unlock AI-powered summaries and ask questions about your project input.',
  },
  analysisButton: {
    id: 'app.containers.Admin.projects.project.ideas.analysisAction',
    defaultMessage: 'Go to AI analysis',
  },
  consentModalTitle: {
    id: 'app.containers.Admin.projects.project.ideas.consentModalTitle',
    defaultMessage: 'Before you continue',
  },
  consentModalText1: {
    id: 'app.containers.Admin.projects.project.ideas.consentModalText1',
    defaultMessage:
      'By continuing you agree to the using OpenAI as a data processor for this project.',
  },
  consentModalText2: {
    id: 'app.containers.Admin.projects.project.ideas.consentModalText2',
    defaultMessage:
      'The OpenAI APIs power the automated text summaries and parts of the automated tagging experience.',
  },
  consentModalText3: {
    id: 'app.containers.Admin.projects.project.ideas.consentModalText3',
    defaultMessage:
      'We only send what users wrote in their surveys, ideas and comments to the OpenAI APIs, never any information from their profile.',
  },
  consentModalText4: {
    id: 'app.containers.Admin.projects.project.ideas.consentModalText4',
    defaultMessage:
      'OpenAI will not use this data for further training of its models. More information on how OpenAI handles data privacy can be found { link }.',
  },
  consentModalText4LinkText: {
    id: 'app.containers.Admin.projects.project.ideas.consentModalText4LinkText',
    defaultMessage: 'here',
  },
  consentModalText4Link: {
    id: 'app.containers.Admin.projects.project.ideas.consentModalText4Link',
    defaultMessage: 'https://openai.com/api-data-privacy',
  },
  consentModalCheckbox: {
    id: 'app.containers.Admin.projects.project.ideas.consentModalCheckbox',
    defaultMessage:
      'I agree to using OpenAI as a data processor for this project',
  },
  consentModalButton: {
    id: 'app.containers.Admin.projects.project.ideas.consentModalButton',
    defaultMessage: 'Continue',
  },
  consentModalCancel: {
    id: 'app.containers.Admin.projects.project.ideas.consentModalCancel',
    defaultMessage: 'Cancel',
  },
});
