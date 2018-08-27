import { API } from 'typings';
import { isEmpty } from 'lodash-es';

interface Options {
  errors: {
    [fieldName: string]: API.Error[]
  } | null;
  saved: boolean;
}

export default function getSubmitState<DiffType>({ errors, saved, diff }: Options & {diff: DiffType}): 'disabled' | 'enabled' | 'error' | 'success' {
  if (errors && !isEmpty(errors)) {
    return 'error';
  }
  if (saved && isEmpty(diff)) {
    return 'success';
  }
  return isEmpty(diff) ? 'disabled' : 'enabled';
}
