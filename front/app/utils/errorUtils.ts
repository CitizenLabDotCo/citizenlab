import { CLErrorsJSON, CLErrors, CLErrorsWrapper } from 'typings';
import messages from './messages';
import { isArray } from 'lodash-es';
import { isObject } from './helperUtils';
import clHistory from 'utils/cl-router/history';

export function isCLErrorJSON(value: unknown): value is CLErrorsJSON {
  let objectToCheck = value;
  for (const prop of ['json', 'errors']) {
    if (
      // value is an object
      typeof objectToCheck === 'object' &&
      !Array.isArray(objectToCheck) &&
      objectToCheck !== null &&
      // value object has prop as key
      Object.prototype.hasOwnProperty.call(objectToCheck, prop)
    ) {
      objectToCheck = objectToCheck[prop];
    } else {
      return false;
    }
  }

  return true;
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

export type GenericErrorKey = (typeof genericErrors)[number];
// Here are all custom validations I could find in the back-end and that could make some sense to the end user

// NB : (sometimes it'd be clearly better the user doesn't see that error,
// it's probably our system that's at fault. Decided to add them either way, they can contact us with a bit more info in that case)

export type CustomErrorKey = 'includes_banned_words';
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

// There's a similar function above but it's kind of insane, so
// I'm creating a new one
export const isCLErrorsJSON = (value: unknown): value is CLErrorsJSON => {
  return isObject(value) && 'json' in value && isObject(value.json.errors);
};

// This is to check if it's not the JSON wrapper but the normal response
export const isCLErrorsWrapper = (value: unknown): value is CLErrorsWrapper => {
  return isObject(value) && isObject(value.errors);
};

// This one checks both. Needed because right now the 'old' utils/request
// and the new fetcher deal with errors differently (the former wraps it in json)
// attribute, the latter doesn't)
export const isCLErrorsIsh = (
  value: unknown
): value is CLErrorsJSON | CLErrorsWrapper => {
  return isCLErrorJSON(value) || isCLErrorsWrapper(value);
};

export const handleCLErrorWrapper = (
  error: CLErrorsWrapper,
  handleError: (error: string, options: Record<string, any>) => void,
  fieldArrayKey?: string
) => {
  error.errors
    ? Object.keys(error.errors).forEach((key) => {
        if (fieldArrayKey) {
          Object.keys(error.errors[key]).forEach((errorKey) => {
            const errorValue = error.errors[key][errorKey][0];
            handleError(
              `${fieldArrayKey}.${key}.${errorKey}`,
              errorValue === 'string' ? { error: errorValue } : errorValue
            );
          });
        } else {
          const errorValue = error.errors[key][0];
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

export const handleCLErrorsJSON = (
  error: CLErrorsJSON,
  handleError: (error: string, options: Record<string, any>) => void,
  fieldArrayKey?: string
) => {
  handleCLErrorWrapper(error.json, handleError, fieldArrayKey);
};

// This one handles both. Needed because right now the 'old' utils/request
// and the new fetcher deal with errors differently (the former wraps it in json
// attribute, the latter doesn't)
export const handleCLErrorsIsh = (
  error: CLErrorsJSON | CLErrorsWrapper,
  handleError: (error: string, options: Record<string, any>) => void,
  fieldArrayKey?: string
) => {
  isCLErrorJSON(error)
    ? handleCLErrorsJSON(error, handleError, fieldArrayKey)
    : handleCLErrorWrapper(error, handleError, fieldArrayKey);
};

export const handleHookFormSubmissionError = (
  error: Error | CLErrorsJSON,
  handleError: (
    name: string,
    error: { type: string; message?: string },
    config?: { shouldFocus?: boolean }
  ) => void,
  fieldArrayKey?: string
) => {
  console.log(error);

  if (isCLErrorsJSON(error)) {
    handleCLErrorsJSON(error, handleError, fieldArrayKey);
  } else {
    console.log(1);

    handleError(
      'title_multiloc',
      {
        message: 'You are using faulty language',
        type: 'manual',
      },
      { shouldFocus: true }
    );
  }
};

export const handleBlockedUserError = (status: number, data: CLErrors) => {
  if (
    status === 401 &&
    isObject(data) &&
    isObject(data.errors) &&
    'base' in data.errors &&
    isArray(data.errors.base) &&
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
    isArray(obj.errors.base) &&
    obj.errors.base.length >= 0 &&
    'error' in obj.errors.base[0] &&
    obj.errors.base[0].error === 'Unauthorized!'
  ) {
    return true;
  }

  return false;
};
