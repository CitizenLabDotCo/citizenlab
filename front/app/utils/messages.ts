import { defineMessages } from 'react-intl';

export default defineMessages({
  // Idea form
  api_error_idea_title_blank: {
    id: 'app.utils.errors.default.api_error_idea_title_multiloc_blank',
    defaultMessage: 'Please provide a title',
  },
  api_error_idea_title_multiloc_too_long: {
    id: 'app.utils.errors.default.api_error_idea_title_multiloc_too_long',
    defaultMessage: 'The idea title must be less than 80 characters long',
  },
  api_error_idea_title_multiloc_too_short: {
    id: 'app.utils.errors.default.api_error_idea_title_multiloc_too_short',
    defaultMessage: 'The idea title must be at least 10 characters long',
  },
  api_error_contribution_title_blank: {
    id: 'app.utils.errors.default.api_error_contribution_title_multiloc_blank',
    defaultMessage: 'Please provide a title',
  },
  api_error_contribution_title_multiloc_too_long: {
    id: 'app.utils.errors.default.api_error_contribution_title_multiloc_too_long',
    defaultMessage:
      'The contribution title must be less than 80 characters long',
  },
  api_error_contribution_title_multiloc_too_short: {
    id: 'app.utils.errors.default.api_error_contribution_title_multiloc_too_short',
    defaultMessage:
      'The contribution title must be at least 10 characters long',
  },
  api_error_includes_banned_words: {
    id: 'api_error_includes_banned_words',
    defaultMessage:
      'You may have used one or more words that are considered profanity by {guidelinesLink}. Please alter your text to remove any profanities that might be present.',
  },

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
});
