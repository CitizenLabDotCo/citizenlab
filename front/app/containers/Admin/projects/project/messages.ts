import { defineMessages } from 'react-intl';

export default defineMessages({
  // edit - index
  generalTab: {
    id: 'app.containers.AdminPage.ProjectEdit.generalTab',
    defaultMessage: 'General',
  },
  descriptionTab: {
    id: 'app.containers.AdminPage.ProjectEdit.descriptionTab',
    defaultMessage: 'Description',
  },
  inputManagerTab: {
    id: 'app.containers.AdminPage.ProjectEdit.inputManagerTab',
    defaultMessage: 'Input manager',
  },
  inputFormTab: {
    id: 'app.containers.AdminPage.ProjectEdit.inputFormTab',
    defaultMessage: 'Input form',
  },
  volunteeringTab: {
    id: 'app.containers.AdminPage.ProjectEdit.volunteeringTab',
    defaultMessage: 'Volunteering',
  },
  pollTab: {
    id: 'app.containers.AdminPage.ProjectEdit.pollTab',
    defaultMessage: 'Poll',
  },
  phasesTab: {
    id: 'app.containers.AdminPage.ProjectEdit.phasesTab',
    defaultMessage: 'Timeline',
  },
  allowedInputTopicsTab: {
    id: 'app.containers.AdminPage.ProjectEdit.allowedInputTopicsTab',
    defaultMessage: 'Allowed input tags',
  },
  permissionsTab: {
    id: 'app.containers.AdminPage.ProjectEdit.permissionsTab',
    defaultMessage: 'Access rights',
  },
  eventsTab: {
    id: 'app.containers.AdminPage.ProjectEdit.eventsTab',
    defaultMessage: 'Events',
  },
  newProject: {
    id: 'app.containers.AdminPage.ProjectEdit.newProject',
    defaultMessage: 'New Project',
  },
  addNewIdea: {
    id: 'app.containers.AdminPage.ProjectEdit.addNewIdea',
    defaultMessage: 'Add an idea',
  },
  addNewInput: {
    id: 'app.containers.AdminPage.ProjectEdit.addNewInput',
    defaultMessage: 'Add an input',
  },
  addNewProject: {
    id: 'app.containers.AdminPage.ProjectEdit.addNewProject',
    defaultMessage: 'Add a project',
  },
  addNewIssue: {
    id: 'app.containers.AdminPage.ProjectEdit.addNewIssue',
    defaultMessage: 'Add an issue',
  },
  addNewQuestion: {
    id: 'app.containers.AdminPage.ProjectEdit.addNewQuestion',
    defaultMessage: 'Add a question',
  },
  addNewOption: {
    id: 'app.containers.AdminPage.ProjectEdit.addNewOption',
    defaultMessage: 'Add an option',
  },
  addNewContribution: {
    id: 'app.containers.AdminPage.ProjectEdit.addNewContribution',
    defaultMessage: 'Add a contribution',
  },
  viewPublicProject: {
    id: 'app.containers.AdminPage.ProjectEdit.viewPublicProject',
    defaultMessage: 'View project',
  },
  // edit - participationContext -----------------------------------------------
  noVotingLimitErrorMessage: {
    id: 'app.containers.AdminPage.ProjectEdit.noVotingLimitErrorMessage',
    defaultMessage: 'Not a valid number',
  },
  noBudgetingAmountErrorMessage: {
    id: 'app.containers.AdminPage.ProjectEdit.noBudgetingAmountErrorMessage',
    defaultMessage: 'Not a valid amount',
  },
  participationMethodTitleText: {
    id: 'app.containers.AdminPage.ProjectEdit.participationMethodTitleText',
    defaultMessage: 'What do you want to do?',
  },
  phaseMethodChangeWarning: {
    id: 'app.containers.AdminPage.ProjectEdit.phaseMethodChangeWarning',
    defaultMessage:
      "Some participation methods aren't available for existing phases. A new phase will have to be created in these cases.",
  },
  projectMethodChangeWarning: {
    id: 'app.containers.AdminPage.ProjectEdit.projectMethodChangeWarning',
    defaultMessage:
      "Some participation methods aren't available for existing projects. A new project will have to be created in these cases.",
  },
  participationMethodTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.participationMethodTooltip',
    defaultMessage: 'Choose how users can participate.',
  },
  shareInformation: {
    id: 'app.containers.AdminPage.ProjectEdit.shareInformation',
    defaultMessage: 'Share information',
  },
  shareInformationDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.shareInformationDescription',
    defaultMessage: 'Provide information to participants.',
  },
  inputAndFeedback: {
    id: 'app.containers.AdminPage.ProjectEdit.inputAndFeedback',
    defaultMessage: 'Collect input and feedback',
  },
  inputAndFeedbackDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.inputAndFeedbackDescription',
    defaultMessage:
      'Create or collect inputs, votes and/or comments. Pick between different types of inputs: idea collection, option analysis, question and answer, issue identification and more.',
  },
  createExternalSurveyText: {
    id: 'app.containers.AdminPage.ProjectEdit.createExternalSurveyText',
    defaultMessage: 'Create an external survey',
  },
  createSurveyDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.createSurveyDescription',
    defaultMessage:
      'Embed a Typeform, Google Form, Enalyzer, SurveyXact, Qualtrics, SmartSurvey, Snap Survey or Microsoft Forms survey.',
  },
  conductParticipatoryBudgetingText: {
    id: 'app.containers.AdminPage.ProjectEdit.conductParticipatoryBudgetingText',
    defaultMessage: 'Conduct a budget allocation exercise',
  },
  conductParticipatoryBudgetingDescriptionText: {
    id: 'app.containers.AdminPage.ProjectEdit.conductParticipatoryBudgetingDescriptionText',
    defaultMessage:
      'Assign a budget to projects and ask participants to select their preferred projects that fit within a total budget.',
  },
  createNativeSurvey: {
    id: 'app.containers.AdminPage.ProjectEdit.createNativeSurvey',
    defaultMessage: 'Create an in-platform survey',
  },
  createNativeSurveyDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.createNativeSurveyDescription',
    defaultMessage: 'Set up a survey without leaving our platform.',
  },
  createPoll: {
    id: 'app.containers.AdminPage.ProjectEdit.createPoll',
    defaultMessage: 'Create a poll',
  },
  createPollDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.createPollDescription',
    defaultMessage: 'Set up a multiple-choice questionnaire.',
  },
  findVolunteers: {
    id: 'app.containers.AdminPage.ProjectEdit.findVolunteers',
    defaultMessage: 'Find volunteers',
  },
  findVolunteersDescriptionText: {
    id: 'app.containers.AdminPage.ProjectEdit.findVolunteersDescriptionText',
    defaultMessage: 'Ask participants to volunteer for activities and causes.',
  },
  totalBudget: {
    id: 'app.containers.AdminPage.ProjectEdit.totalBudget',
    defaultMessage: 'Total budget',
  },
  totalBudgetExplanation: {
    id: 'app.containers.AdminPage.ProjectEdit.totalBudgetExplanation',
    defaultMessage:
      "By default, your budget is set using your local currency. You can change your platform's currency to 'credits' or 'tokens' by contacting our support center.",
  },
  minimum: {
    id: 'app.containers.AdminPage.ProjectEdit.minimum',
    defaultMessage: 'Minimum',
  },
  minimumTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.minimumTooltip',
    defaultMessage:
      "Require participants to meet a minimum budget to submit their basket (enter '0' if you would not like to set a minimum).",
  },
  maximum: {
    id: 'app.containers.AdminPage.ProjectEdit.maximum',
    defaultMessage: 'Maximum',
  },
  maximumTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.maximumTooltip',
    defaultMessage:
      'Participants cannot exceed this budget when submitting their basket.',
  },
  inputPostingEnabled: {
    id: 'app.containers.AdminPage.ProjectEdit.inputPostingEnabled',
    defaultMessage: 'Submitting inputs',
  },
  inputCommentingEnabled: {
    id: 'app.containers.AdminPage.ProjectEdit.inputCommentingEnabled',
    defaultMessage: 'Commenting on inputs',
  },
  inputVotingEnabled: {
    id: 'app.containers.AdminPage.ProjectEdit.inputVotingEnabled',
    defaultMessage: 'Voting on inputs',
  },
  upvotingMethodTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.upvotingMethodTitle',
    defaultMessage: 'Number of upvotes per participant',
  },
  downvotingMethodTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.downvotingMethodTitle',
    defaultMessage: 'Number of downvotes per participant',
  },
  maxUpvotes: {
    id: 'app.containers.AdminPage.ProjectEdit.maxUpvotes',
    defaultMessage: 'Maximum upvotes',
  },
  maxDownvotes: {
    id: 'app.containers.AdminPage.ProjectEdit.maxDownvotes',
    defaultMessage: 'Maximum downvotes',
  },
  downvotingPosts: {
    id: 'app.containers.AdminPage.ProjectEdit.downvotingPosts',
    defaultMessage: 'Enable downvoting',
  },
  disableDownvotingTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.disableDownvotingTooltip',
    defaultMessage:
      'This will disable downvoting, but upvoting will still be enabled. You can disable voting completely in the Actions section of this tab.',
  },
  downvotingDisabled: {
    id: 'app.containers.AdminPage.ProjectEdit.downvotingDisabled',
    defaultMessage: 'Disabled',
  },
  downvotingEnabled: {
    id: 'app.containers.AdminPage.ProjectEdit.downvotingEnabled',
    defaultMessage: 'Enabled',
  },
  phasePermissions: {
    id: 'app.containers.AdminPage.ProjectEdit.phasePermissions',
    defaultMessage: 'Enabled actions',
  },
  phasePermissionsTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.phasePermissionsTooltip',
    defaultMessage:
      'Select what participative action users can take during this ideation phase.',
  },
  unlimited: {
    id: 'app.containers.AdminPage.ProjectEdit.unlimited',
    defaultMessage: 'Unlimited',
  },
  limited: {
    id: 'app.containers.AdminPage.ProjectEdit.limited',
    defaultMessage: 'Limited',
  },
  anonymousPolling: {
    id: 'app.containers.AdminPage.ProjectEdit.anonymousPolling',
    defaultMessage: 'Anonymous polling',
  },
  anonymousPollingTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.anonymousPollingTooltip',
    defaultMessage:
      "When enabled it's impossible to see who voted on what. Users still need an account and can only vote once.",
  },
  enabled: {
    id: 'app.containers.AdminPage.ProjectEdit.enabled',
    defaultMessage: 'Enabled',
  },
  disabled: {
    id: 'app.containers.AdminPage.ProjectEdit.disabled',
    defaultMessage: 'Disabled',
  },
  inputsDefaultView: {
    id: 'app.containers.AdminPage.ProjectEdit.inputsDefaultView',
    defaultMessage: 'Default view',
  },
  defaultSorting: {
    id: 'app.containers.AdminPage.ProjectEdit.defaultSorting',
    defaultMessage: 'Sorting',
  },
  inputsDefaultViewTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.inputsDefaultViewTooltip',
    defaultMessage:
      "Choose the default view of participant's inputs: cards in a grid view or pins on a map. Participants can manually switch between the two views.",
  },
  defaultPostSortingTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.defaultPostSortingTooltip',
    defaultMessage:
      'You can set the default order for posts to be displayed on the main project page.',
  },
  cardDisplay: {
    id: 'app.containers.AdminPage.ProjectEdit.cardDisplay',
    defaultMessage: 'Cards',
  },
  mapDisplay: {
    id: 'app.containers.AdminPage.ProjectEdit.mapDisplay',
    defaultMessage: 'Map',
  },
  trendingSortingMethod: {
    id: 'app.containers.AdminPage.ProjectEdit.trendingSortingMethod',
    defaultMessage: 'Trending',
  },
  randomSortingMethod: {
    id: 'app.containers.AdminPage.ProjectEdit.randomSortingMethod',
    defaultMessage: 'Random',
  },
  popularSortingMethod: {
    id: 'app.containers.AdminPage.ProjectEdit.popularSortingMethod',
    defaultMessage: 'Most voted',
  },
  newestSortingMethod: {
    id: 'app.containers.AdminPage.ProjectEdit.newestFirstSortingMethod',
    defaultMessage: 'Most recent',
  },
  oldestSortingMethod: {
    id: 'app.containers.AdminPage.ProjectEdit.oldestFirstSortingMethod',
    defaultMessage: 'Oldest',
  },
  surveyService: {
    id: 'app.containers.AdminPage.ProjectEdit.surveyService',
    defaultMessage: 'Survey Service',
  },
  surveyServiceTooltipLink: {
    id: 'app.containers.AdminPage.ProjectEdit.surveyServiceTooltipLink',
    defaultMessage:
      'http://support.citizenlab.co/en-your-citizenlab-platform-step-by-step/faq-s/how-do-i-add-a-survey-to-my-platform',
  },
  surveyServiceTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.surveyServiceTooltip',
    defaultMessage:
      'Choose what survey tool you want to embed. All information can be found {surveyServiceTooltipLink}.',
  },
  surveyServiceTooltipLinkText: {
    id: 'app.containers.AdminPage.ProjectEdit.surveyServiceTooltipLinkText',
    defaultMessage: 'here',
  },
  typeform: {
    id: 'app.containers.AdminPage.ProjectEdit.typeform',
    defaultMessage: 'Typeform',
  },
  enalyzer: {
    id: 'app.containers.AdminPage.ProjectEdit.enalyzer',
    defaultMessage: 'Enalyzer',
  },
  qualtrics: {
    id: 'app.containers.AdminPage.ProjectEdit.qualtrics',
    defaultMessage: 'Qualtrics',
  },
  smart_survey: {
    id: 'app.containers.AdminPage.ProjectEdit.smart_survey',
    defaultMessage: 'SmartSurvey',
  },
  snap_survey: {
    id: 'app.containers.AdminPage.ProjectEdit.snap_survey',
    defaultMessage: 'Snap Survey',
  },
  microsoft_forms: {
    id: 'app.containers.AdminPage.ProjectEdit.microsoft_forms',
    defaultMessage: 'Microsoft Forms',
  },
  survey_xact: {
    id: 'app.containers.AdminPage.ProjectEdit.survey_xact',
    defaultMessage: 'SurveyXact',
  },
  survey_monkey: {
    id: 'app.containers.AdminPage.ProjectEdit.survey_monkey',
    defaultMessage: 'Survey Monkey',
  },
  google_forms: {
    id: 'app.containers.AdminPage.ProjectEdit.google_forms',
    defaultMessage: 'Google Forms',
  },
  documentAnnotationMethod: {
    id: 'app.containers.AdminPage.ProjectEdit.documentAnnotationMethod',
    defaultMessage: 'Collect feedback on document',
  },
  documentAnnotationMethodDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.documentAnnotationMethodDescription',
    defaultMessage:
      'Embed an interactive PDF and collect comments and feedback with Konveio',
  },
  surveyEmbedUrl: {
    id: 'app.containers.AdminPage.ProjectEdit.surveyEmbedUrl',
    defaultMessage: 'Survey Embed URL',
  },
  documentAnnotationEmbedUrl: {
    id: 'app.containers.AdminPage.ProjectEdit.documentAnnotationEmbedUrl',
    defaultMessage: 'Embed URL',
  },
  titleSurveyResults: {
    id: 'app.containers.AdminPage.ProjectEdit.SurveyResults.titleSurveyResults',
    defaultMessage: 'Consult the survey answers',
  },
  subtitleSurveyResults: {
    id: 'app.containers.AdminPage.ProjectEdit.SurveyResults.subtitleSurveyResults',
    defaultMessage:
      'Here, you can download the results of the surveys within this project as an exel file. For now, you can only see here the typeform surveys.',
  },
  surveyResultsTab: {
    id: 'app.containers.AdminPage.ProjectEdit.SurveyResults.surveyResultsTab',
    defaultMessage: 'Survey Results',
  },
  surveyTab: {
    id: 'app.containers.AdminPage.ProjectEdit.SurveyResults.surveyTab',
    defaultMessage: 'Survey',
  },
  exportSurveyResults: {
    id: 'app.containers.AdminPage.ProjectEdit.SurveyResults.exportSurveyResults',
    defaultMessage: 'Export survey results',
  },
  titleInputManager: {
    id: 'app.containers.AdminPage.ProjectEdit.PostManager.titleInputManager',
    defaultMessage: 'Input manager',
  },
  subtitleInputManager: {
    id: 'app.containers.AdminPage.ProjectEdit.PostManager.subtitleInputManager',
    defaultMessage:
      'Give feedback, assign topics or copy inputs to the next project phase.',
  },
  hiddenFieldsTip: {
    id: 'app.components.admin.PostManager.hiddenFieldsTip',
    defaultMessage:
      'Tip: add {hiddenFieldsLink} when setting up your Typeform survey to keep track of who has responded to your survey.',
  },
  hiddenFieldsLinkText: {
    id: 'app.components.admin.PostManager.hiddenFieldsLink',
    defaultMessage: 'hidden fields',
  },
  hiddenFieldsSupportArticleUrl: {
    id: 'app.components.admin.PostManager.hiddenFieldsSupportArticleUrl',
    defaultMessage: 'https://support.citizenlab.co/en/articles/1641202',
  },
  ideaTerm: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.ideaTerm',
    defaultMessage: 'Idea',
  },
  projectTerm: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectTerm',
    defaultMessage: 'Project',
  },
  questionTerm: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.questionTerm',
    defaultMessage: 'Question',
  },
  optionTerm: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.optionTerm',
    defaultMessage: 'Option',
  },
  issueTerm: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.issueTerm',
    defaultMessage: 'Issue',
  },
  contributionTerm: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.contributionTerm',
    defaultMessage: 'Contribution',
  },
  inputTermSelectLabel: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.inputTermSelectLabel',
    defaultMessage: 'What should an input be called?',
  },
  minBudgetLargerThanMaxError: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.minBudgetLargerThanMaxError',
    defaultMessage:
      "The minimum budget can't be larger than the maximum budget",
  },
  minBudgetRequired: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.minBudgetRequired',
    defaultMessage: 'A minimum budget is required',
  },
  maxBudgetRequired: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.maxBudgetRequired',
    defaultMessage: 'A maximum budget is required',
  },
  googleFormsTooltip: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.googleFormsTooltip',
    defaultMessage:
      'More information on how to embed a link for Google Forms can be found in {googleFormsTooltipLink}.',
  },
  googleFormsTooltipLink: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.googleFormsTooltipLink',
    defaultMessage:
      'https://support.citizenlab.co/en/articles/5050525-how-to-embed-your-google-forms-survey-in-a-project-phase',
  },
  googleFormsTooltipLinkText: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.googleFormsTooltipLinkText',
    defaultMessage: 'this support article',
  },
});
