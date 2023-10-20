import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.containers.AdminPage.projects.project.analysis.LaunchModal.title',
    defaultMessage: 'How to work with AI',
  },
  subtitle: {
    id: 'app.containers.AdminPage.projects.project.analysis.LaunchModal.subtitle',
    defaultMessage:
      'We recommend using AI-generated summaries as a starting point for understanding large datasets, but not as the final word.',
  },
  limitation1Title: {
    id: 'app.containers.AdminPage.projects.project.analysis.LaunchModal.limitation1Title',
    defaultMessage: 'Hallucinations:',
  },
  limitation1Text: {
    id: 'app.containers.AdminPage.projects.project.analysis.LaunchModal.limitation1Text',
    defaultMessage:
      'While rare, the AI might occasionally generate information that was not explicitly present in the original dataset.',
  },
  limitation2Title: {
    id: 'app.containers.AdminPage.projects.project.analysis.LaunchModal.limitation2Title',
    defaultMessage: 'Exaggeration:',
  },
  limitation2Text: {
    id: 'app.containers.AdminPage.projects.project.analysis.LaunchModal.limitation2Text',
    defaultMessage:
      'The AI might emphasize certain themes or ideas more than others, potentially skewing the overall interpretation.',
  },
  limitation3Title: {
    id: 'app.containers.AdminPage.projects.project.analysis.LaunchModal.limitation3Title',
    defaultMessage: 'Data Volume and Accuracy:',
  },
  limitation3Text: {
    id: 'app.containers.AdminPage.projects.project.analysis.LaunchModal.limitation3Text',
    defaultMessage:
      'Our system is optimized for handling 20-200 well-defined inputs for the most accurate results. As the volume of data increases beyond this range, the summary may become more high-level and generalized. This does not mean the AI becomes "less accurate", but rather that it will focus on broader trends and patterns. For more nuanced insights, we recommend using the (auto)-tagging feature to segment larger datasets into smaller, more manageable subsets.',
  },
  description: {
    id: 'app.containers.AdminPage.projects.project.analysis.LaunchModal.description',
    defaultMessage:
      'Our platform enables you to explore the core themes, summarize the data, and examine various perspectives. If you are looking for specific answers or insights, consider using the "Ask a Question" feature to dive deeper beyond the summary.',
  },
  agreeButton: {
    id: 'app.containers.AdminPage.projects.project.analysis.LaunchModal.agreeButton',
    defaultMessage: 'I understand',
  },
});
