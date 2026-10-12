import { captureMessage, captureException, withScope } from '@sentry/react';
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

// Shared by our Sentry reporters, so their events can be filtered the same way.

function isFramed() {
  try {
    return window.self !== window.top;
  } catch {
    // Cross-origin parents throw on access, which means we are framed.
    return true;
  }
}

export function secondsSincePageLoad() {
  return Math.round(performance.now() / 1000);
}

// Tags are indexed by Sentry, so these are searchable on every report.
export function baseReportTags() {
  return {
    tenant_host: window.location.hostname,
    in_iframe: isFramed(),
  };
}
