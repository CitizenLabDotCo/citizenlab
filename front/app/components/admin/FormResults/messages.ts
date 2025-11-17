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

  previousInsight: {
    id: 'app.containers.Admin.projects.project.survey.previousInsight',
    defaultMessage: 'Previous insight',
  },
  nextInsight: {
    id: 'app.containers.Admin.projects.project.survey.nextInsight',
    defaultMessage: 'Next insight',
  },

  cancel: {
    id: 'app.containers.Admin.projects.project.survey.cancel',
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
});
