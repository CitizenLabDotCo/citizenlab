import { isEmpty, isError } from 'lodash-es';
import { Errors } from 'utils/getSubmitState';

interface Parameters {
  errors: Errors;
  saved: boolean;
  attributeDiff: Record<string, any> | null;
}

export default function getSubmitState({
  errors,
  saved,
  attributeDiff,
}: Parameters) {
  if (errors && (!isEmpty(errors) || isError(errors))) {
    return 'error';
  } else if (saved && isEmpty(attributeDiff)) {
    return 'success';
  } else if (isEmpty(attributeDiff)) {
    return 'disabled';
  } else {
    return 'enabled';
  }
}
