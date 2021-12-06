import { isEmpty, isError } from 'lodash-es';
import { Errors } from 'utils/getSubmitState';
import { State } from '.';

interface Parameters {
  errors: Errors;
  saved: boolean;
  state: State;
}

export default function getSubmitState({ errors, saved, state }: Parameters) {
  const {
    attributesDiff,
    updateAllInputInNavbar,
    updateEventsInNavbar,
  } = state;

  const emptyAttributesDiff = isEmpty(attributesDiff);
  const noNavbarUpdates =
    updateAllInputInNavbar === null && updateEventsInNavbar === null;

  if (errors && (!isEmpty(errors) || isError(errors))) {
    return 'error';
  }

  if (saved && emptyAttributesDiff && noNavbarUpdates) {
    return 'success';
  }

  return emptyAttributesDiff && noNavbarUpdates ? 'disabled' : 'enabled';
}
