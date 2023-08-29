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
    defaultMessage: '2. The AI is not a human',
  },
  limitation2Text: {
    id: 'app.containers.AdminPage.projects.project.analysis.LaunchModal.limitation2Text',
    defaultMessage:
      'The AI is not a human and will not be able to understand the context of the inputs. It will not be able to understand sarcasm or irony.',
  },
});
