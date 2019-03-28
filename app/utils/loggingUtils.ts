import * as Sentry from '@sentry/browser';
import { isEmpty } from 'lodash-es';

function isErrorOrErrorEvent(wat: any) {
  return Object.prototype.toString.call(wat) === '[object Error]' || Object.prototype.toString.call(wat) === '[object ErrorEvent]';
}

function isObject(wat: any) {
  return Object.prototype.toString.call(wat) === '[object Object]';
}

function isString(wat: any) {
  return typeof wat === 'string';
}

export function reportError(error: any) {
  if (isEmpty(error)) {
    Sentry.captureMessage('An empty error has been thrown');
  } else if (isErrorOrErrorEvent(error)) {
    Sentry.captureException(error);
  } else if (isObject(error)) {
    Sentry.captureMessage(JSON.stringify(error, null, 4));
  } else if (isString(error)) {
    Sentry.captureMessage(error);
  } else {
    Sentry.withScope(scope => {
      scope.setExtra('error', error);
      Sentry.captureMessage('Something wrong happened');
    });
  }
}
