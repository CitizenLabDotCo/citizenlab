import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.containers.AdminPage.projects.project.analysis.LaunchModal.title',
    defaultMessage: 'Limitations',
  },
  subtitle: {
    id: 'app.containers.AdminPage.projects.project.analysis.LaunchModal.subtitle',
    defaultMessage:
      'We heavily recommend not to take AI generated summaries at face value and look at the data.',
  },
  limitation1Title: {
    id: 'app.containers.AdminPage.projects.project.analysis.LaunchModal.limitation1Title',
    defaultMessage: 'Hallucinations:',
  },
  limitation1Text: {
    id: 'app.containers.AdminPage.projects.project.analysis.LaunchModal.limitation1Text',
    defaultMessage: 'the AI might make up non existing ideas',
  },
  limitation2Title: {
    id: 'app.containers.AdminPage.projects.project.analysis.LaunchModal.limitation2Title',
    defaultMessage: 'Exaggeration:',
  },
  limitation2Text: {
    id: 'app.containers.AdminPage.projects.project.analysis.LaunchModal.limitation2Text',
    defaultMessage: 'the AI might give excessive importance to one idea',
  },
  agreeButton: {
    id: 'app.containers.AdminPage.projects.project.analysis.LaunchModal.agreeButton',
    defaultMessage: 'I understand',
  },
});
