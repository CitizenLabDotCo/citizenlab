import { defineMessages } from 'react-intl';

export default defineMessages({
  emptyList: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.emptyList',
    defaultMessage:
      'Your text summaries will be displayed here, but you currently do not have any yet.',
  },
  emptyListDescription: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.emptyListDescription',
    defaultMessage: 'Click the Auto-summarize button above to get started.',
  },
  questionFor: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.questionsFor',
    defaultMessage: 'Questions for',
  },
  summaryFor: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.summaryFor',
    defaultMessage: 'Summary for',
  },
  questionForAllInputs: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.questionsForAllInputs',
    defaultMessage: 'Question for all inputs',
  },
  summaryForAllInputs: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.summaryForAllInputs',
    defaultMessage: 'Summary for all inputs',
  },
  restoreFilters: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.restoreFilters',
    defaultMessage: 'Restore filters',
  },
  accuracy: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.accuracy',
    defaultMessage: 'Accuracy: {accuracy}{percentage}',
  },
  percentage: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.percentage',
    defaultMessage: '%',
  },
  questionAccuracyTooltip: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.questionAccuracyTooltip',
    defaultMessage:
      'Asking questions about fewer inputs leads to a higher accuracy. Reduce the current input selection by using tags, search or demographic filters.',
  },
  deleteSummary: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.deleteSummary',
    defaultMessage: 'Delete summary',
  },
  deleteSummaryConfirmation: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.deleteSummaryConfirmation',
    defaultMessage: 'Are you sure you want to delete these summaries?',
  },
  deleteQuestion: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.deleteQuestion',
    defaultMessage: 'Delete question',
  },
  deleteQuestionConfirmation: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.deleteQuestionConfirmation',
    defaultMessage: 'Are you sure you want to delete this question?',
  },
  askQuestion: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.askQuestion',
    defaultMessage: 'Ask a question',
  },
  tooManyInputs: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.tooManyInputsMessage',
    defaultMessage:
      'The AI can’t process so many inputs in one go. Divide them into smaller groups.',
  },
  summarize: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.summarizeButton',
    defaultMessage: 'Summarize',
  },
  ask: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.ask',
    defaultMessage: 'Ask',
  },
  rate: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.rate',
    defaultMessage: 'Rate the quality of this insight',
  },
  thankYou: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.thankYou',
    defaultMessage: 'Thank you for your feedback',
  },
  askAQuestionUpsellMessage: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.askAQuestionUpsellMessage',
    defaultMessage:
      'Instead of summarising, you can ask relevant questions to your data. This feature is not included in your current plan. Talk to your Government Success Manager or admin to unlock it.',
  },
  tooltipTextLimit: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.tooltipTextLimit',
    defaultMessage:
      'You can summarise a maximum of 30 inputs at a time on your current plan. Talk to your GovSuccess Manager or admin to unlock more.',
  },
  inputsSelected: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.inputsSelected',
    defaultMessage: 'inputs selected',
  },
  additionalCustomFields: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.customFields',
    defaultMessage: 'This insight includes the following questions:',
  },
  aiSummary: {
    id: 'app.containers.Admin.projects.project.analysis.aiSummary',
    defaultMessage: 'AI summary',
  },
  aiDisclaimerBanner: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.aiDisclaimerBanner',
    defaultMessage:
      'AI can make mistakes. Please verify important information.',
  },
  aiDisclaimerDetails: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.aiDisclaimerDetails',
    defaultMessage:
      'The content in this section is AI-generated and may not be completely accurate. Please review and verify it against your inputs. Selecting fewer inputs can help improve accuracy.',
  },
  aiSummaryTooltip: {
    id: 'app.containers.Admin.projects.project.analysis.aiSummaryTooltipText',
    defaultMessage:
      'This is AI-generated content. It may not be 100% accurate. Please review and cross-reference with the actual inputs for accuracy. Be aware that the accuracy is likely to improve if the number of selected inputs is reduced.',
  },
  taskFailureUnsupportedFileType: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.taskFailureUnsupportedFileType',
    defaultMessage:
      'This file type is not supported for AI analysis. Please use a different file format.',
  },
  taskFailureTooManyImages: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.taskFailureTooManyImages',
    defaultMessage:
      'The request includes too many images. Try attaching fewer files or reducing the number of images per file.',
  },
  taskFailureGenericError: {
    id: 'app.containers.AdminPage.projects.project.analysis.Insights.taskFailureGenericError',
    defaultMessage:
      'The request could not be completed. Please try again later.',
  },
});
