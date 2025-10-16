import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.components.admin.ProjectCreationModeModal.title',
    defaultMessage: 'How would you like to create your project?',
  },
  subtitle: {
    id: 'app.components.admin.ProjectCreationModeModal.subtitle',
    defaultMessage:
      'Choose whether you want to create a project manually or let AI help you get started.',
  },
  manualModeTitle: {
    id: 'app.components.admin.ProjectCreationModeModal.manualModeTitle',
    defaultMessage: 'Manual',
  },
  manualModeDescription: {
    id: 'app.components.admin.ProjectCreationModeModal.manualModeDescription',
    defaultMessage:
      'Create a project from scratch by filling out all the details yourself.',
  },
  aiModeTitle: {
    id: 'app.components.admin.ProjectCreationModeModal.aiModeTitle',
    defaultMessage: 'AI-assisted',
  },
  aiModeDescription: {
    id: 'app.components.admin.ProjectCreationModeModal.aiModeDescription',
    defaultMessage:
      'Describe your project idea and let AI help generate the structure and content.',
  },
  aiDescriptionLabel: {
    id: 'app.components.admin.ProjectCreationModeModal.aiDescriptionLabel',
    defaultMessage: 'Describe your project idea',
  },
  aiDescriptionPlaceholder: {
    id: 'app.components.admin.ProjectCreationModeModal.aiDescriptionPlaceholder',
    defaultMessage:
      'For example: "We want to improve our downtown area by gathering community ideas on better lighting, more green spaces, and improved accessibility. We need input from residents and local business owners."',
  },
  aiDescriptionHint: {
    id: 'app.components.admin.ProjectCreationModeModal.aiDescriptionHint',
    defaultMessage:
      "Be as specific as possible about your goals, target audience, and what kind of input you're looking for.",
  },
  cancel: {
    id: 'app.components.admin.ProjectCreationModeModal.cancel',
    defaultMessage: 'Cancel',
  },
  continue: {
    id: 'app.components.admin.ProjectCreationModeModal.continue',
    defaultMessage: 'Continue',
  },
});
