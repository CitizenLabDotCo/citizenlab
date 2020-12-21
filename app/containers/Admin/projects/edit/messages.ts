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
  postsTab: {
    id: 'app.containers.AdminPage.ProjectEdit.postsTab',
    defaultMessage: 'Posts',
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
  participationMethod: {
    id: 'app.containers.AdminPage.ProjectEdit.participationMethod',
    defaultMessage: 'Participation method',
  },
  participationMethodTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.participationMethodTooltip',
    defaultMessage: 'Choose how users can participate.',
  },
  information: {
    id: 'app.containers.AdminPage.ProjectEdit.information',
    defaultMessage: 'Information',
  },
  informationDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.informationDescription',
    defaultMessage:
      'Users can only read the information you provide, they cannot participate actively.',
  },
  ideationAndFeedback: {
    id: 'app.containers.AdminPage.ProjectEdit.ideationAndFeedback',
    defaultMessage: 'Ideation and feedback',
  },
  ideationAndFeedbackDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.ideationAndFeedbackDescription',
    defaultMessage:
      'Create or crowdsource inputs that participants can vote and comment on. Supports idea collection, options analysis, question and answers, issue identification and more.',
  },
  survey: {
    id: 'app.containers.AdminPage.ProjectEdit.survey',
    defaultMessage: 'Survey',
  },
  surveyDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.surveyDescription',
    defaultMessage:
      'You integrate a survey in which the users can participate.',
  },
  participatoryBudgeting: {
    id: 'app.containers.AdminPage.ProjectEdit.participatoryBudgeting',
    defaultMessage: 'Participatory Budgeting',
  },
  pbDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.pbDescription',
    defaultMessage:
      'Participants are assigned a budget that allocate towards different projects.',
  },
  poll: {
    id: 'app.containers.AdminPage.ProjectEdit.poll',
    defaultMessage: 'Poll',
  },
  pollDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.pollDescription',
    defaultMessage: 'Users can answer a short multiple-choice questionnaire.',
  },
  volunteering: {
    id: 'app.containers.AdminPage.ProjectEdit.volunteering',
    defaultMessage: 'Volunteering',
  },
  volunteeringDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.volunteeringDescription',
    defaultMessage: 'Users can volunteer for the causes you define.',
  },
  amountPerCitizen: {
    id: 'app.containers.AdminPage.ProjectEdit.amountPerCitizen',
    defaultMessage: 'Amount per citizen, in {currency}',
  },
  postingEnabled: {
    id: 'app.containers.AdminPage.ProjectEdit.postingEnabled',
    defaultMessage: 'Posting ideas',
  },
  commentingEnabled: {
    id: 'app.containers.AdminPage.ProjectEdit.commentingEnabled',
    defaultMessage: 'Commenting',
  },
  votingEnabled: {
    id: 'app.containers.AdminPage.ProjectEdit.votingEnabled',
    defaultMessage: 'Voting',
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
  postsDefaultDisplay: {
    id: 'app.containers.AdminPage.ProjectEdit.postsDefaultDisplay',
    defaultMessage: 'Posts default display',
  },
  defaultSorting: {
    id: 'app.containers.AdminPage.ProjectEdit.defaultSorting',
    defaultMessage: 'Sorting',
  },
  postsDefaultDisplayTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.postsDefaultDisplayTooltip',
    defaultMessage:
      'Choose the default view for your project: cards in a grid view or pins on a map. Participants can manually switch between the two views.',
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
  titlePosts: {
    id: 'app.components.admin.PostManager.titlePosts',
    defaultMessage: 'Post manager',
  },
  subtitlePosts: {
    id: 'app.components.admin.PostManager.subtitlePosts',
    defaultMessage:
      'Give feedback, assign topics or copy posts to the next project phase.',
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
  inputTermLabel: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.inputTermLabel',
    defaultMessage: 'How should a post in this project be called?',
  },
});
