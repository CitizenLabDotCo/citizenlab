import { defineMessages } from 'react-intl';

export default defineMessages({
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
});
