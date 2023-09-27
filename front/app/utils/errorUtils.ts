import { CLErrors, CLErrorsWrapper } from 'typings';
import messages from './messages';
import { isObject } from './helperUtils';
import clHistory from 'utils/cl-router/history';

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

type GenericErrorKey = (typeof genericErrors)[number];
// Here are all custom validations I could find in the back-end and that could make some sense to the end user

// NB : (sometimes it'd be clearly better the user doesn't see that error,
// it's probably our system that's at fault. Decided to add them either way, they can contact us with a bit more info in that case)

type CustomErrorKey = 'includes_banned_words';
// | 'already_liked'
// | 'already_disliked'
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

export function getDefaultApiErrorMessage(
  error: GenericErrorKey | CustomErrorKey | string,
  field?: string
) {
  // We don't get the values (ie the min char count a text input, so they have to be hard-coded in the translations and kept in sync with the BE hardcoded value).
  return (
    messages[`api_error_${field}_${error}`] ||
    messages[`api_error_${error}`] ||
    messages[`api_error_invalid`]
  );
}

// Some basic validations we support, removed anything tht should be controlled by the form display and not the user.
type DefaultAjvKeywords =
  | 'required'
  | 'additionalItems'
  | 'maximum'
  | 'minimum'
  | 'maxItems'
  | 'minItems'
  | 'maxLength'
  | 'minLength'
  | 'uniqueItems';

export function getDefaultAjvErrorMessage({
  keyword,
  format,
  type,
}: {
  keyword: DefaultAjvKeywords | string;
  format?: string;
  type?: string;
}) {
  // Here the vales contained in ErrorMessage['params'] should be passed along for translation.
  return (
    messages[`ajv_error_${format || type}_${keyword}`] ||
    messages[`ajv_error_${format}_any`] ||
    messages[`ajv_error_${keyword}`] ||
    messages[`ajv_error_invalid`]
  );
}

// This is to check if it's not the JSON wrapper but the normal response
const isCLErrorsWrapper = (value: unknown): value is CLErrorsWrapper => {
  return isObject(value) && isObject(value.errors);
};

// Roughly inspired on setError's type (UseFormSetError) from react-hook-form, but more adjustments needed
// error type doesn't fully match
type THandleError = (
  name: string,
  error?: {
    error?: string;
    value?: string;
    type?: string;
    message?: string;
  }
) => void;

const handleCLErrorWrapper = (
  error: CLErrorsWrapper,
  handleError: THandleError,
  fieldArrayKey?: string
) => {
  error.errors
    ? Object.keys(error.errors).forEach((key) => {
        if (fieldArrayKey) {
          Object.keys(error.errors[key]).forEach((errorKey) => {
            const errorValue = error.errors[key][errorKey][0];
            // handleError is (nearly) always methods.setError from what I can see. The format of error (2nd argument)
            // we pass doesn't match setError's types but it works somehow.
            handleError(
              `${fieldArrayKey}.${key}.${errorKey}`,
              typeof errorValue === 'string'
                ? { error: errorValue }
                : errorValue
            );
          });
        } else {
          const errorValue = error.errors[key][0];
          // handleError is (nearly) always methods.setError from what I can see. The format of error (2nd argument)
          // we pass doesn't match setError's types but it works somehow.
          handleError(
            key,
            typeof errorValue === 'string' ? { error: errorValue } : errorValue
          );
        }
      })
    : handleError('submissionError', {
        type: 'server',
      });
};

export const handleHookFormSubmissionError = (
  error: Error | CLErrorsWrapper,
  handleError: (error: string, options: Record<string, any>) => void,
  fieldArrayKey?: string
) => {
  if (isCLErrorsWrapper(error)) {
    handleCLErrorWrapper(error, handleError, fieldArrayKey);
  } else {
    handleError('submissionError', {
      type: 'server',
    });
  }
};

export const handleBlockedUserError = (status: number, data: CLErrors) => {
  if (
    status === 401 &&
    isObject(data) &&
    isObject(data.errors) &&
    'base' in data.errors &&
    Array.isArray(data.errors.base) &&
    data.errors.base.length >= 0 &&
    'error' in data.errors.base[0] &&
    data.errors.base[0].error === 'blocked' &&
    window.location.href.indexOf('disabled-account') === -1
  ) {
    clHistory.push(
      `/disabled-account?date=${data.errors.base[0].details.block_end_at}`
    );
  }
};

export const isUnauthorizedRQ = (obj: unknown): obj is CLErrors => {
  if (
    isObject(obj) &&
    'errors' in obj &&
    'base' in obj.errors &&
    Array.isArray(obj.errors.base) &&
    obj.errors.base.length >= 0 &&
    'error' in obj.errors.base[0] &&
    obj.errors.base[0].error === 'Unauthorized!'
  ) {
    return true;
  }

  return false;
};
