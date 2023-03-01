import { isEmpty, isError } from 'lodash-es';
import { Errors } from 'utils/getSubmitState';
import { State } from '.';

interface Parameters {
  errors: Errors;
  saved: boolean;
  state: State;
}

export default function getSubmitState({ errors, saved, state }: Parameters) {
  const { attributesDiff } = state;

  const emptyAttributesDiff = isEmpty(attributesDiff);

  if (errors && (!isEmpty(errors) || isError(errors))) {
    return 'error';
  }

  if (saved && emptyAttributesDiff) {
    return 'success';
  }

  return emptyAttributesDiff ? 'disabled' : 'enabled';
}
