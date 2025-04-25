import { defineMessages } from 'react-intl';

export default defineMessages({
  totalSurveyResponses: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.totalSurveyResponses2',
    defaultMessage: 'Total {count} responses',
  },
  noSurveyResponses: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.noSurveyResponses2',
    defaultMessage: 'No survey responses yet',
  },
  required: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.required2',
    defaultMessage: 'Required',
  },
  optional: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.optional2',
    defaultMessage: 'Optional',
  },
  openAnalysis: {
    id: 'app.containers.Admin.projects.project.survey.openAnalysis',
    defaultMessage: 'Open AI analysis',
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
  previousInsight: {
    id: 'app.containers.Admin.projects.project.survey.previousInsight',
    defaultMessage: 'Previous insight',
  },
  nextInsight: {
    id: 'app.containers.Admin.projects.project.survey.nextInsight',
    defaultMessage: 'Next insight',
  },
  createAnalysis: {
    id: 'app.containers.Admin.projects.project.survey.newAnalysis',
    defaultMessage: 'New analysis',
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
  allResponses: {
    id: 'app.containers.Admin.projects.project.survey.allResponses',
    defaultMessage: 'All responses',
  },
  explore: {
    id: 'app.containers.Admin.projects.project.survey.explore',
    defaultMessage: 'Explore',
  },
  accuracy: {
    id: 'app.containers.Admin.projects.project.survey.analysis.accuracy',
    defaultMessage: 'Accuracy: {accuracy}{percentage}',
  },
  percentage: {
    id: 'app.containers.Admin.projects.project.survey.analysis.percentage',
    defaultMessage: '%',
  },
  refresh: {
    id: 'app.containers.Admin.projects.project.survey.analysis.refresh',
    defaultMessage: '{ count } new responses',
  },
  regenerate: {
    id: 'app.containers.Admin.projects.project.survey.analysis.regenerate',
    defaultMessage: 'Regenerate',
  },
  backgroundTaskFailedMessage: {
    id: 'app.containers.Admin.projects.project.survey.analysis.backgroundTaskFailedMessage',
    defaultMessage:
      'There was an error generating the AI summary. Please try to regenerate it below.',
  },
  showSummaries: {
    id: 'app.containers.Admin.projects.project.survey.analysis.showInsights',
    defaultMessage: 'Show AI insights',
  },
  hideSummaries: {
    id: 'app.containers.Admin.projects.project.survey.analysis.hideSummaries',
    defaultMessage: 'Hide summaries for this question',
  },
  createAIAnalysis: {
    id: 'app.containers.Admin.projects.project.survey.analysis.createAIAnalysis',
    defaultMessage: 'Open AI analysis',
  },
  openAnalysisActions: {
    id: 'app.containers.Admin.projects.project.survey.analysis.openAnalysisActions',
    defaultMessage: 'Open analysis actions',
  },
  inputsSelected: {
    id: 'app.containers.Admin.projects.project.survey.analysis.inputsSelected',
    defaultMessage: 'inputs selected',
  },
  tooltipTextLimit: {
    id: 'app.containers.Admin.projects.project.survey.analysis.tooltipTextLimit',
    defaultMessage:
      'You can summarise a maximum of 30 inputs at a time on your current plan. Talk to your GovSuccess Manager or admin to unlock more.',
  },
  otherResponses: {
    id: 'app.containers.Admin.projects.project.survey.otherResponses',
    defaultMessage: 'Other responses',
  },
  followUpResponses: {
    id: 'app.containers.Admin.projects.project.survey.followUpResponses',
    defaultMessage: 'Follow up responses',
  },
  allFiles: {
    id: 'app.containers.Admin.projects.project.survey.allFiles',
    defaultMessage: 'All files',
  },
  responses: {
    id: 'app.containers.Admin.projects.project.survey.responses',
    defaultMessage: 'Responses',
  },
  heatMap: {
    id: 'app.containers.Admin.projects.project.survey.heatMap',
    defaultMessage: 'Heat map',
  },
  heatmapView: {
    id: 'app.containers.Admin.projects.project.survey.heatmapView',
    defaultMessage: 'Heat map view',
  },
  heatmapToggleTooltip: {
    id: 'app.containers.Admin.projects.project.survey.heatmapToggleTooltip',
    defaultMessage:
      'The heat map is generated using Esri Smart Mapping. Heat maps are useful when there is a large amount of data points. For fewer points, it may be better to look at only the location points directly. {heatmapToggleEsriLinkText}',
  },
  heatmapToggleEsriLinkText: {
    id: 'app.containers.Admin.projects.project.survey.heatmapToggleEsriLinkText',
    defaultMessage:
      'Learn more about heat maps generated using Esri Smart Mapping.',
  },
  heatmapToggleEsriLink: {
    id: 'app.containers.Admin.projects.project.survey.heatmapToggleEsriLink',
    defaultMessage:
      'https://storymaps.arcgis.com/collections/9dd9f03ac2554da4af78b42020fb40c1?item=13',
  },
  page: {
    id: 'app.containers.Admin.projects.project.survey.page',
    defaultMessage: 'Page',
  },
  sentiment_linear_scale: {
    id: 'app.containers.Admin.projects.project.survey.sentiment_linear_scale',
    defaultMessage: 'Sentiment scale',
  },
  hiddenByLogic: {
    id: 'app.containers.Admin.projects.project.survey.hiddenByLogic2',
    defaultMessage: ' - Hidden by logic',
  },
  logicSkipTooltipPage: {
    id: 'app.containers.Admin.projects.project.survey.logicSkipTooltipPage4',
    defaultMessage:
      'Logic on this page skips all pages until page { pageNumber } ({ numQuestionsSkipped } questions skipped). Click to hide or show the skipped pages and questions.',
  },
  logicSkipTooltipOption: {
    id: 'app.containers.Admin.projects.project.survey.logicSkipTooltipOption4',
    defaultMessage:
      'When a user selects this answer logic skips all pages until page { pageNumber } ({ numQuestionsSkipped } questions skipped). Click to hide or show the skipped pages and questions.',
  },
  logicSkipTooltipPageSurveyEnd: {
    id: 'app.containers.Admin.projects.project.survey.logicSkipTooltipPageSurveyEnd2',
    defaultMessage:
      'Logic on this page skips to the survey end ({ numQuestionsSkipped } questions skipped). Click to hide or show the skipped pages and questions.',
  },
  logicSkipTooltipOptionSurveyEnd: {
    id: 'app.containers.Admin.projects.project.survey.logicSkipTooltipOptionSurveyEnd2',
    defaultMessage:
      'When a user selects this answer logic skips to the survey end ({ numQuestionsSkipped } questions skipped). Click to hide or show the skipped pages and questions.',
  },
  resultsCountQuestionTooltip: {
    id: 'app.containers.Admin.projects.project.survey.resultsCountQuestionTooltip',
    defaultMessage:
      'The number of responses for this question is lower than the total number of survey responses because some respondents will not have seen this question because of logic in the survey.',
  },
  resultsCountPageTooltip: {
    id: 'app.containers.Admin.projects.project.survey.resultsCountPageTooltip',
    defaultMessage:
      'The number of responses for this page is lower than the total number of survey responses because some respondents will not have seen this page because of logic in the survey.',
  },
});
