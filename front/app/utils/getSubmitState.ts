import { CLError } from 'typings';
import { isEmpty, isError } from 'lodash-es';

export type Errors =
  | {
      [fieldName: string]: CLError[];
    }
  | null
  | Record<string, never>
  | Error;

interface Options {
  errors: Errors;
  saved: boolean;
  diff: Record<string, any> | null;
}

export default function getSubmitState({ errors, saved, diff }: Options) {
  if (errors && (!isEmpty(errors) || isError(errors))) {
    return 'error';
  }

  if (saved && isEmpty(diff)) {
    return 'success';
  }

  return isEmpty(diff) ? 'disabled' : 'enabled';
}
