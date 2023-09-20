import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.containers.AdminPage.projects.project.analysis.LaunchModal.title',
    defaultMessage: 'How to work with AI',
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
  description1: {
    id: 'app.containers.AdminPage.projects.project.analysis.LaunchModal.description1',
    defaultMessage:
      'The more data you use, the less accurate AI becomes. Based on our experience, everything between 20-200 inputs delivers great results if the input is well defined. If you’re exceeding this limit, the best approach is to use the (auto)-tagging feature to create smaller datasets for a better analysis.',
  },
  description2: {
    id: 'app.containers.AdminPage.projects.project.analysis.LaunchModal.description2',
    defaultMessage:
      'Our system helps you to uncover the underlying talking points, summarise it and look for different angles. Looking for specific answers? Use ‘Ask a question’ to go beyond the summary.',
  },
  agreeButton: {
    id: 'app.containers.AdminPage.projects.project.analysis.LaunchModal.agreeButton',
    defaultMessage: 'I understand',
  },
});
