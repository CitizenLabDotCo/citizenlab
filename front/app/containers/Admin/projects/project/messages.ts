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
  setup: {
    id: 'app.containers.AdminPage.ProjectEdit.setup',
    defaultMessage: 'Setup',
  },
  inputFormTab: {
    id: 'app.containers.AdminPage.ProjectEdit.inputFormTab',
    defaultMessage: 'Input form',
  },
  mapTab: {
    id: 'app.containers.AdminPage.ProjectEdit.mapTab',
    defaultMessage: 'Map',
  },
  volunteeringTab: {
    id: 'app.containers.AdminPage.ProjectEdit.volunteeringTab',
    defaultMessage: 'Volunteering',
  },
  phaseAccessRights: {
    id: 'app.containers.AdminPage.ProjectEdit.phaseAccessRights',
    defaultMessage: 'Access rights',
  },
  pollTab: {
    id: 'app.containers.AdminPage.ProjectEdit.pollTab',
    defaultMessage: 'Poll',
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
  viewPublicProject: {
    id: 'app.containers.AdminPage.ProjectEdit.viewPublicProject',
    defaultMessage: 'View project',
  },
  // edit - participationContext -----------------------------------------------
  optionAnalysisLinkText: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.optionAnalysisLinkText',
    defaultMessage: 'Option analysis overview',
  },
  learnMoreVotingMethod: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.learnMoreVotingMethod',
    defaultMessage:
      'Learn more about when to use <b> {voteTypeDescription} </b> in our {optionAnalysisArticleLink}.',
  },
  multipleVotesPerOption: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.multipleVotesPerOption2',
    defaultMessage: 'multiple votes per option',
  },
  singleVotePerOption: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.singleVotePerOption2',
    defaultMessage: 'single vote per option',
  },
  budgetAllocation: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.budgetAllocation2',
    defaultMessage: 'budget allocation',
  },
  maxVotesPerOptionErrorText: {
    id: 'app.containers.AdminPage.ProjectEdit.maxVotesPerOptionErrorText',
    defaultMessage:
      'Maximum number of votes per option must be less than or equal to total number of votes',
  },
  voteTermError: {
    id: 'app.containers.AdminPage.ProjectEdit.voteTermError',
    defaultMessage: 'Vote terms must be specified for all locales',
  },
  noReactingLimitErrorMessage: {
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
  participationMethodTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.participationMethodTooltip',
    defaultMessage: 'Choose how users can participate.',
  },
  shareInformation: {
    id: 'app.containers.AdminPage.ProjectEdit.shareInformation',
    defaultMessage: 'Share information',
  },
  inputAndFeedback: {
    id: 'app.containers.AdminPage.ProjectEdit.inputAndFeedback',
    defaultMessage: 'Collect input and feedback',
  },
  inputAndFeedbackDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.inputAndFeedbackDescription2',
    defaultMessage:
      'Create or collect inputs, reactions and/or comments. Pick between different types of inputs: idea collection, option analysis, question and answer, issue identification and more.',
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
  conductVotingOrPrioritizationText: {
    id: 'app.containers.AdminPage.ProjectEdit.conductVotingOrPrioritizationText',
    defaultMessage: 'Conduct a voting or prioritization exercise',
  },
  conductVotingOrPrioritizationDescriptionText: {
    id: 'app.containers.AdminPage.ProjectEdit.conductVotingOrPrioritizationDescriptionText2',
    defaultMessage:
      'Select a voting method, and have users prioritize between a few different options.',
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
  inputReactingEnabled: {
    id: 'app.containers.AdminPage.ProjectEdit.inputReactingEnabled',
    defaultMessage: 'Reacting to inputs',
  },
  likingMethodTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.likingMethodTitle',
    defaultMessage: 'Number of likes per participant',
  },
  dislikingMethodTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.dislikingMethodTitle',
    defaultMessage: 'Number of dislikes per participant',
  },
  maxLikes: {
    id: 'app.containers.AdminPage.ProjectEdit.maxLikes',
    defaultMessage: 'Maximum likes',
  },
  maxDislikes: {
    id: 'app.containers.AdminPage.ProjectEdit.maxDislikes',
    defaultMessage: 'Maximum dislikes',
  },
  dislikingPosts: {
    id: 'app.containers.AdminPage.ProjectEdit.dislikingPosts',
    defaultMessage: 'Enable disliking',
  },
  disableDislikingTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.disableDislikingTooltip2',
    defaultMessage:
      'This will enable or disable disliking, but liking will still be enabled. We recommend leaving this disabled unless you are carrying out an option analysis.',
  },
  dislikingDisabled: {
    id: 'app.containers.AdminPage.ProjectEdit.downvotingDisabled',
    defaultMessage: 'Disabled',
  },
  dislikingEnabled: {
    id: 'app.containers.AdminPage.ProjectEdit.downvotingEnabled',
    defaultMessage: 'Enabled',
  },
  enabledActionsForUsers: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.enabledActionsForUsers',
    defaultMessage: 'Actions for users',
  },
  enabledActionsForUsersDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.enabledActionsForUsersDescription',
    defaultMessage: 'Select what additional actions users can take.',
  },
  defaultViewOptions: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.defaultViewOptions',
    defaultMessage: 'Default view of options',
  },
  optionsToVoteOn: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.optionsToVoteOn',
    defaultMessage: 'Options to vote on',
  },
  commentingBias: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.commentingBias',
    defaultMessage: 'Allowing users to comment can bias the voting process.',
  },
  enabledActionsTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.enabledActionsTooltip2',
    defaultMessage: 'Select what participative actions users can take.',
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
  comments_countSortingMethod: {
    id: 'app.containers.AdminPage.ProjectEdit.commens_countSortingMethod',
    defaultMessage: 'Most discussed',
  },
  randomSortingMethod: {
    id: 'app.containers.AdminPage.ProjectEdit.randomSortingMethod',
    defaultMessage: 'Random',
  },
  popularSortingMethod: {
    id: 'app.containers.AdminPage.ProjectEdit.popularSortingMethod2',
    defaultMessage: 'Most reactions',
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
    id: 'app.containers.AdminPage.ProjectEdit.surveyServiceTooltipLink1',
    defaultMessage:
      'https://support.govocal.com/en/articles/7025887-creating-an-external-survey-project',
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
    id: 'app.containers.AdminPage.ProjectEdit.documentAnnotationMethod1',
    defaultMessage: 'Collect feedback on a document',
  },
  documentAnnotationMethodDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.documentAnnotationMethodDescription1',
    defaultMessage:
      'Embed an interactive PDF and collect comments and feedback with Konveio.',
  },
  surveyEmbedUrl: {
    id: 'app.containers.AdminPage.ProjectEdit.surveyEmbedUrl',
    defaultMessage: 'Survey Embed URL',
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
  resultsTab: {
    id: 'app.containers.AdminPage.ProjectEdit.SurveyResults.resultsTab',
    defaultMessage: 'Results',
  },
  surveyTab: {
    id: 'app.containers.AdminPage.ProjectEdit.SurveyResults.surveyTab',
    defaultMessage: 'Survey',
  },
  surveyFormTab: {
    id: 'app.containers.AdminPage.ProjectEdit.SurveyResults.surveyFormTab',
    defaultMessage: 'Survey form',
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
  importInputs: {
    id: 'app.containers.AdminPage.ProjectEdit.PostManager.importInputs',
    defaultMessage: 'Import',
  },
  votingShareResultsTurnedOff: {
    id: 'app.containers.AdminPage.ProjectEdit.PostManager.votingShareResultsTurnedOff',
    defaultMessage: 'Result sharing is turned off.',
  },
  votingShareResultsTurnedOff2: {
    id: 'app.containers.AdminPage.ProjectEdit.PostManager.votingShareResultsTurnedOff2',
    defaultMessage:
      "Voting results won't be shared at the end of the phase unless you modify it in the phase setup.",
  },
  votingShareResultsTurnedOn: {
    id: 'app.containers.AdminPage.ProjectEdit.PostManager.votingShareResultsTurnedOn2',
    defaultMessage:
      'These results will be automatically shared once the phase ends. Modify the end date of this phase to change when the results are shared.',
  },
  subtitleInputProjectProposals: {
    id: 'app.containers.AdminPage.ProjectEdit.PostManager.subtitleInputProjectProposals',
    defaultMessage: 'Manage proposals, give feedback and assign topics.',
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
    defaultMessage: 'https://support.govocal.com/en/articles/1641202',
  },
  // #input_term_copy
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
  proposalTerm: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.proposalTerm',
    defaultMessage: 'Proposal',
  },
  initiativeTerm: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.initiativeTerm',
    defaultMessage: 'Initiative',
  },
  petitionTerm: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.petitionTerm',
    defaultMessage: 'Petition',
  },
  inputTermSelectLabel: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.inputTermSelectLabel',
    defaultMessage: 'What should an input be called?',
  },
  minTotalVotesLargerThanMaxError: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.minTotalVotesLargerThanMaxError',
    defaultMessage:
      "The minimum number of votes can't be larger than the maximum number",
  },
  minBudgetLargerThanMaxError: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.minBudgetLargerThanMaxError',
    defaultMessage:
      "The minimum budget can't be larger than the maximum budget",
  },
  maxVotesPerOptionError: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.maxVotesPerOptionError',
    defaultMessage:
      'Maximum number of votes per option must be less than or equal to total number of votes',
  },
  minVotesRequired: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.minVotesRequired',
    defaultMessage: 'A minimum number of votes is required',
  },
  minBudgetRequired: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.minBudgetRequired',
    defaultMessage: 'A minimum budget is required',
  },
  maxVotesRequired: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.maxVotesRequired',
    defaultMessage: 'A maximum number of votes is required',
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
      'https://support.govocal.com/en/articles/5050525-how-to-embed-your-google-forms-survey-in-a-project-phase',
  },
  googleFormsTooltipLinkText: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.googleFormsTooltipLinkText',
    defaultMessage: 'this support article',
  },
  contactGovSuccessToAccess: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.contactGovSuccessToAccess',
    defaultMessage:
      'Collecting feedback on a document is a custom feature, and is not included in your current license. Reach out to your GovSuccess Manager to learn more about it.',
  },
  optionsToVoteOnDescription: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.optionsToVoteOnDescription2',
    defaultMessage: 'Configure the voting options in the {optionsPageLink}.',
  },
  optionsToVoteOnDescWihoutPhase: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.optionsToVoteOnDescWihoutPhase',
    defaultMessage:
      'Configure the voting options in the Input manager tab after creating a phase.',
  },
  optionsPageText: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.optionsPageText2',
    defaultMessage: 'Input Manager tab',
  },
  reportTab: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.report',
    defaultMessage: 'Report',
  },
  lockedTooltip: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.lockedTooltip',
    defaultMessage:
      'This is not included in your current plan. Reach out to your Government Success Manager or admin to unlock it.',
  },
  trafficTab: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.trafficTab',
    defaultMessage: 'Traffic',
  },
  timelineTab: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.timelineTab',
    defaultMessage: 'Timeline',
  },
  participationTab: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.participationTab',
    defaultMessage: 'Participants',
  },
  messagingTab: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.messagingTab',
    defaultMessage: 'Messaging',
  },
  expireDaysLimit: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.expireDaysLimit',
    defaultMessage: 'Number of days to reach minimum number of votes',
  },
  reactingThreshold: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.reactingThreshold',
    defaultMessage: 'Minimum number of votes to be considered',
  },
  expireDateLimitRequired: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.expireDateLimitRequired',
    defaultMessage: 'Number of days is required',
  },
  reactingThresholdRequired: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.reactingThresholdRequired',
    defaultMessage: 'Minimum number of votes is required',
  },
  participationOptions: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.participationOptions',
    defaultMessage: 'Participation options',
  },
  prescreeningText: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.screeningText',
    defaultMessage: 'Require screening of inputs',
  },
  prescreeningSubtext: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.prescreeningSubtext',
    defaultMessage:
      'Inputs won’t be visible until an admin reviews and approves them. Authors can’t edit inputs after they are screened or reacted on.',
  },
  missingStartDateError: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.missingStartDateError',
    defaultMessage: 'Missing start date',
  },
  missingEndDateError: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.missingEndDateError',
    defaultMessage: 'Missing end date',
  },
});
