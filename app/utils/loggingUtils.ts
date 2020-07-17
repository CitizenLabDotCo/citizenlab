import { captureMessage, captureException, withScope } from '@sentry/browser';
import { isEmpty, isError, isObject } from 'lodash-es';

function isErrorOrErrorEvent(wat: any) {
  return (
    isError(wat) ||
    Object.prototype.toString.call(wat) === '[object ErrorEvent]'
  );
}

function isString(wat: any) {
  return typeof wat === 'string';
}

export function reportError(error: any) {
  if (isErrorOrErrorEvent(error)) {
    captureException(error);
  } else if (isEmpty(error)) {
    captureMessage('An empty error has been thrown');
  } else if (isObject(error)) {
    captureMessage(JSON.stringify(error, null, 4));
  } else if (isString(error)) {
    captureMessage(error);
  } else {
    withScope((scope) => {
      scope.setExtra('error', error);
      captureMessage('Something wrong happened');
    });
  }
}
