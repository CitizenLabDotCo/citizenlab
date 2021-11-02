import { CLError } from 'typings';
import { isEmpty, isError } from 'lodash-es';

interface Options {
  errors:
    | {
        [fieldName: string]: CLError[];
      }
    | null
    | Record<string, never>
    | Error;
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
