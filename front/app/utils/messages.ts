import { defineMessages } from 'react-intl';

export default defineMessages({
  // Defaults
  api_error_confirmation: {
    id: 'app.utils.errors.default.api_error_confirmation',
    defaultMessage: "Doesn't match",
  },
  api_error_accepted: {
    id: 'app.utils.errors.default.api_error_accepted',
    defaultMessage: 'Must be accepted',
  },
  api_error_inclusion: {
    id: 'app.utils.errors.default.api_error_inclusion',
    defaultMessage: 'Is not included in the list',
  },
  api_error_exclusion: {
    id: 'app.utils.errors.default.api_error_exclusion',
    defaultMessage: 'Is reserved',
  },
  api_error_invalid: {
    id: 'app.utils.errors.default.api_error_invalid',
    defaultMessage: 'Is invalid',
  },
  api_error_empty: {
    id: 'app.utils.errors.default.api_error_empty',
    defaultMessage: "Can't be empty",
  },
  api_error_blank: {
    id: 'app.utils.errors.default.api_error_blank',
    defaultMessage: "Can't be blank",
  },
  api_error_present: {
    id: 'app.utils.errors.default.api_error_present',
    defaultMessage: 'Must be blank',
  },
  api_error_too_long: {
    id: 'app.utils.errors.default.api_error_too_long',
    defaultMessage: 'Is too long',
  },
  api_error_too_short: {
    id: 'app.utils.errors.default.api_error_too_short',
    defaultMessage: 'Is too short',
  },
  api_error_wrong_length: {
    id: 'app.utils.errors.default.api_error_wrong_length',
    defaultMessage: 'Is the wrong length',
  },
  api_error_not_a_number: {
    id: 'app.utils.errors.default.api_error_not_a_number',
    defaultMessage: 'Is not a number',
  },
  api_error_not_an_integer: {
    id: 'app.utils.errors.default.api_error_not_an_integer',
    defaultMessage: 'Must be an integer',
  },
  api_error_greater_than: {
    id: 'app.utils.errors.default.api_error_greater_than',
    defaultMessage: 'Is too small',
  },
  api_error_greater_than_or_equal_to: {
    id: 'app.utils.errors.default.api_error_greater_than_or_equal_to',
    defaultMessage: 'Is too small',
  },
  api_error_equal_to: {
    id: 'app.utils.errors.default.api_error_equal_to',
    defaultMessage: 'Is not right',
  },
  api_error_less_than: {
    id: 'app.utils.errors.default.api_error_less_than',
    defaultMessage: 'Is too big',
  },
  api_error_less_than_or_equal_to: {
    id: 'app.utils.errors.default.api_error_less_than_or_equal_to',
    defaultMessage: 'Is too big',
  },
  api_error_other_than: {
    id: 'app.utils.errors.default.api_error_other_than',
    defaultMessage: 'Is not right',
  },
  api_error_in: {
    id: 'app.utils.errors.api_error_default.in',
    defaultMessage: 'Is not right',
  },
  api_error_odd: {
    id: 'app.utils.errors.defaultapi_error_.odd',
    defaultMessage: 'Must be odd',
  },
  api_error_even: {
    id: 'app.utils.errors.default.api_error_even',
    defaultMessage: 'Must be even',
  },
  ajv_error_minItems: {
    id: 'app.utils.errors.default.ajv_error_minItems',
    defaultMessage:
      'Must include at least {limit, plural, one {# item} other {# items}}',
  },
  ajv_error_maxItems: {
    id: 'app.utils.errors.default.ajv_error_maxItems',
    defaultMessage:
      "Can't include more than {limit, plural, one {# item} other {# items}}",
  },
  ajv_error_date_any: {
    id: 'app.utils.errors.default.ajv_error_date_any',
    defaultMessage: 'This field expects a date in the format ',
  },
  ajv_error_number_any: {
    id: 'app.utils.errors.default.ajv_error_number_any',
    defaultMessage: 'This field expects a number',
  },
  ajv_error_required: {
    id: 'app.utils.errors.default.ajv_error_required3',
    defaultMessage: 'Field is required: "{fieldName}"',
  },
  ajv_error_invalid: {
    id: 'app.utils.errors.default.ajv_error_invalid',
    defaultMessage: 'Is invalid',
  },
  ajv_error_type: {
    id: 'app.utils.errors.default.ajv_error_type',
    defaultMessage: "Can't be blank",
  },
  // ParticipationMethodUtils
  onSurveySubmission: {
    id: 'app.utils.participationMethod.onSurveySubmission',
    defaultMessage: 'Thank you. Your response has been received.',
  },
  // #input_term_copy
  ideaFormTitle: {
    id: 'app.utils.IdeasNewPage.ideaFormTitle',
    defaultMessage: 'Add new idea',
  },
  optionFormTitle: {
    id: 'app.utils.IdeasNewPage.optionFormTitle',
    defaultMessage: 'Add new option',
  },
  contributionFormTitle: {
    id: 'app.utils.IdeasNewPage.contributionFormTitle',
    defaultMessage: 'Add new contribution',
  },
  projectFormTitle: {
    id: 'app.utils.IdeasNewPage.projectFormTitle',
    defaultMessage: 'Add new project',
  },
  questionFormTitle: {
    id: 'app.utils.IdeasNewPage.questionFormTitle',
    defaultMessage: 'Add new question',
  },
  issueFormTitle1: {
    id: 'app.utils.IdeasNewPage.issueFormTitle1',
    defaultMessage: 'Add new issue',
  },
  proposalFormTitle: {
    id: 'app.utils.IdeasNewPage.proposalFormTitle',
    defaultMessage: 'Add new proposal',
  },
  initiativeFormTitle: {
    id: 'app.utils.IdeasNewPage.initiativeFormTitle',
    defaultMessage: 'Add new initiative',
  },
  petitionFormTitle: {
    id: 'app.utils.IdeasNewPage.petitionFormTitle',
    defaultMessage: 'Add new petition',
  },
  commentFormTitle: {
    id: 'app.utils.IdeasNewPage.commentFormTitle',
    defaultMessage: 'Add new comment',
  },
  statementFormTitle: {
    id: 'app.utils.IdeasNewPage.statementFormTitle',
    defaultMessage: 'Add new statement',
  },
  surveyTitle: {
    id: 'app.utils.IdeasNewPage.surveyTitle',
    defaultMessage: 'Survey',
  },
  createSurveyText: {
    id: 'app.utils.AdminPage.ProjectEdit.createSurveyText',
    defaultMessage: 'Embed an external survey',
  },
  createNativeSurvey: {
    id: 'app.utils.AdminPage.ProjectEdit.createNativeSurvey',
    defaultMessage: 'Create an in-platform survey',
  },
  createDocumentAnnotation: {
    id: 'app.utils.AdminPage.ProjectEdit.createDocumentAnnotation',
    defaultMessage: 'Collect feedback on a document',
  },
  createPoll: {
    id: 'app.utils.AdminPage.ProjectEdit.createPoll',
    defaultMessage: 'Create a poll',
  },
  inputAndFeedback: {
    id: 'app.utils.AdminPage.ProjectEdit.inputAndFeedback',
    defaultMessage: 'Collect input and feedback',
  },
  conductParticipatoryBudgetingText: {
    id: 'app.utils.AdminPage.ProjectEdit.conductParticipatoryBudgetingText',
    defaultMessage: 'Conduct a budget allocation exercise',
  },
  findVolunteers: {
    id: 'app.utils.AdminPage.ProjectEdit.findVolunteers',
    defaultMessage: 'Find volunteers',
  },
  shareInformation: {
    id: 'app.utils.AdminPage.ProjectEdit.shareInformation',
    defaultMessage: 'Share information',
  },
  trending: {
    id: 'app.utils.IdeaCards.trending',
    defaultMessage: 'Trending',
  },
  mostDiscussed: {
    id: 'app.utils.IdeaCards.mostDiscussed',
    defaultMessage: 'Most discussed',
  },
  random: {
    id: 'app.utils.IdeaCards.random',
    defaultMessage: 'Random',
  },
  mostReacted: {
    id: 'app.utils.IdeaCards.mostReacted',
    defaultMessage: 'Most reactions',
  },
  newest: {
    id: 'app.utils.IdeaCards.newest',
    defaultMessage: 'Newest',
  },
  oldest: {
    id: 'app.utils.IdeaCards.oldest',
    defaultMessage: 'Oldest',
  },
  // Project page utils
  upcomingAndOngoingEvents: {
    id: 'app.containers.Projects.upcomingAndOngoingEvents',
    defaultMessage: 'Upcoming and ongoing events',
  },
  pastEvents: {
    id: 'app.containers.Projects.pastEvents',
    defaultMessage: 'Past events',
  },
  noUpcomingOrOngoingEvents: {
    id: 'app.containers.Projects.noUpcomingOrOngoingEvents',
    defaultMessage: 'No upcoming or ongoing events are currently scheduled.',
  },
  noPastEvents: {
    id: 'app.containers.Projects.noPastEvents',
    defaultMessage: 'No past events to display',
  },
});
