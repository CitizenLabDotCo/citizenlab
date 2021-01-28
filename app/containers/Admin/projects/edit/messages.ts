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
  eventsTab: {
    id: 'app.containers.AdminPage.ProjectEdit.eventsTab',
    defaultMessage: 'Events',
  },
  permissionsTab: {
    id: 'app.containers.AdminPage.ProjectEdit.permissionsTab',
    defaultMessage: 'Permissions',
  },
  topicsTab: {
    id: 'app.containers.AdminPage.ProjectEdit.topicsTab',
    defaultMessage: 'Topics',
  },
  newProject: {
    id: 'app.containers.AdminPage.ProjectEdit.newProject',
    defaultMessage: 'New Project',
  },
  addNewIdea: {
    id: 'app.containers.AdminPage.ProjectEdit.addNewIdea',
    defaultMessage: 'Add an idea',
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
  createSurveyText: {
    id: 'app.containers.AdminPage.ProjectEdit.createSurveyText',
    defaultMessage: 'Create an advanced survey',
  },
  createSurveyDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.createSurveyDescription',
    defaultMessage: 'Embed a Typeform, Google Form or Enalyzer survey.',
  },
  conductParticipatoryBudgetingText: {
    id:
      'app.containers.AdminPage.ProjectEdit.conductParticipatoryBudgetingText',
    defaultMessage: 'Conduct a budget allocation exercise',
  },
  conductParticipatoryBudgetingDescriptionText: {
    id:
      'app.containers.AdminPage.ProjectEdit.conductParticipatoryBudgetingDescriptionText',
    defaultMessage:
      'Assign a budget to projects and ask participants to select their preferred projects that fit within a total budget.',
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
  amountPerCitizen: {
    id: 'app.containers.AdminPage.ProjectEdit.amountPerCitizen',
    defaultMessage: 'Amount per citizen, in {currency}',
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
  votingMethod: {
    id: 'app.containers.AdminPage.ProjectEdit.votingMethod',
    defaultMessage: 'Voting method',
  },
  votingMaximumTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.votingMaximumTooltip',
    defaultMessage:
      'You can set the maximum number of times that a participant can vote.',
  },
  votingLimit: {
    id: 'app.containers.AdminPage.ProjectEdit.votingLimit',
    defaultMessage: 'Voting limit',
  },
  downvoting: {
    id: 'app.containers.AdminPage.ProjectEdit.downvoting',
    defaultMessage: 'Downvoting',
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
  survey_monkey: {
    id: 'app.containers.AdminPage.ProjectEdit.survey_monkey',
    defaultMessage: 'Survey Monkey',
  },
  google_forms: {
    id: 'app.containers.AdminPage.ProjectEdit.google_forms',
    defaultMessage: 'Google Forms',
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
    id:
      'app.containers.AdminPage.ProjectEdit.SurveyResults.subtitleSurveyResults',
    defaultMessage:
      'Here, you can download the results of the surveys within this project as an exel file. For now, you can only see here the typeform surveys.',
  },
  surveyResultsTab: {
    id: 'app.containers.AdminPage.ProjectEdit.SurveyResults.surveyResultsTab',
    defaultMessage: 'Survey Results',
  },
  exportSurveyResults: {
    id:
      'app.containers.AdminPage.ProjectEdit.SurveyResults.exportSurveyResults',
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
    id:
      'app.components.app.containers.AdminPage.ProjectEdit.inputTermSelectLabel',
    defaultMessage: 'What should an input be called?',
  },
});
