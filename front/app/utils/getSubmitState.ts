import { isEmpty, isError } from 'lodash-es';
import { CLErrors } from 'typings';

export type Errors = CLErrors | null | Record<string, never> | Error;

interface Parameters {
  errors: Errors;
  saved: boolean;
  diff: Record<string, any> | null;
}

export default function getSubmitState({ errors, saved, diff }: Parameters) {
  if (errors && (!isEmpty(errors) || isError(errors))) {
    return 'error';
  }

  if (saved && isEmpty(diff)) {
    return 'success';
  }

  return isEmpty(diff) ? 'disabled' : 'enabled';
}
