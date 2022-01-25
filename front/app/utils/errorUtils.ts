import { ErrorObject } from 'ajv';
import { InputTerm } from 'services/participationContexts';
import messages from './messages';

export function isCLErrorJSON(error) {
  return !!(error && error.json && error.json.errors);
}

// NB: initially I wated to pass in a translated field name to the generic error message but in most languages that won't work, not without hacky phrase building.

const genericErrors = [
  'confirmation',
  'accepted',
  'blank',
  'present',
  'too_short',
  'too_long',
  'wrong_length',
  'taken',
  'invalid',
  'inclusion',
  'exclusion',
  'required',
  'not_a_number',
  'greater_than',
  'greater_than_or_equal_to',
  'equal_to',
  'less_than',
  'less_than_or_equal_to',
  'other_than',
  'not_an_integer',
  'odd',
  'even',
] as const;

export type GenericErrorKey = typeof genericErrors[number];
// Here are all custom validations I could find in the back-end and that could make some sense to the end user

// NB : (sometimes it'd be clearly better the user doesn't see that error,
// it's probably our system that's at fault. Decided to add them either way, they can contact us with a bit more info in that case)

export type CustomErrorKey = 'includes_banned_words';
// | 'already_upvoted'
// | 'already_downvoted'
// | 'children_not_allowed'
// | 'less_than_min_budget'
// | 'exceed_budget_limit'
// | 'has_no_budget'
// | 'option_on_non_select_field'
// | 'extension_whitelist_error'
// | 'after_end_at'
// | 'profane'
// | 'expired'
// | 'too_many_retries'
// | 'too_many_resets'
// | 'idea_and_phase_not_same_project'
// | 'assignee_can_not_moderate_initiatives'
// | 'is_not_a_manual_group'
// | 'is_not_timeline_project'
// | 'has_other_overlapping_phases'
// | 'has_other_budgeting_phases'
// | 'not_other_reason'
// | 'unparseable_excel'
// | 'taken_by_invite'
// | 'domain_blacklisted'
// | 'too_common'
// | 'value_required'
// | 'values_not_all_strings'
// | 'unsupported_locales'
// | 'json_schema_invalid'
// | 'assignee_can_not_moderate_project'
// | 'has_invalid_idea_status'
// | 'has_invalid_project'
// | 'has_invalid_topic'
// | 'dangling_group_references'
// | 'cannot_contain_poll_questions'
// | 'cant_change_after_first_response'
// | 'option_and_response_not_in_same_poll'
// | 'not_poll'
// | 'too_few_options'
// | 'too_many_options';
// TODO : make this extensible by modules and actually get most these errrs from the corresponding modules

//
// interface FieldError {
//   fieldKey: string;
//   errors: APIErrorDetail[];
// }

export function getApiErrorMessage(
  error: GenericErrorKey | CustomErrorKey | string,
  inputTerm?: InputTerm,
  field?: string
) {
  // We don't get the values (ie the min char count a text input, so they have to be hard-coded in the translations and kept in sync with the BE hardcoded value).
  return (
    messages[`api_error_${inputTerm}_${field}_${error}`] ||
    messages[`api_error_${field}_${error}`] ||
    messages[`api_error_${error}`] ||
    messages[`api_error_invalid`]
  );
}

export function getAjvErrorMessage(
  error: ErrorObject['keyword'],
  inputTerm?: InputTerm,
  format?: string,
  location?: string
) {
  console.log(error, inputTerm, format, location);
  // Here the vales contained in ErrorMessage['params'] should be passed along for translation.
  return (
    messages[`ajv_error_${inputTerm}_${location}_${error}`] ||
    messages[`ajv_error_${location}_${error}`] ||
    messages[`ajv_error_${format}_${error}`] ||
    messages[`ajv_error_${format}_any`] ||
    messages[`ajv_error_${error}`] ||
    messages[`ajv_error_invalid`]
  );
}
