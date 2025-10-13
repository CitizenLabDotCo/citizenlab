import { CLErrors, CLErrorsWrapper } from 'typings';

import clHistory from 'utils/cl-router/history';

import { isObject } from './helperUtils';

export const isCLErrorsWrapper = (value: unknown): value is CLErrorsWrapper => {
  return isObject(value) && isObject(value.errors);
};

const handleCLErrorWrapper = (
  error: CLErrorsWrapper,
  handleError: (error: string, options: Record<string, any>) => void,
  fieldArrayKey?: string
) => {
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  error.errors
    ? Object.keys(error.errors).forEach((key) => {
        if (fieldArrayKey) {
          Object.keys(error.errors[key]).forEach((errorKey) => {
            const errorValue = error.errors[key][errorKey][0];
            // handleError is (nearly) always methods.setError from what I can see. The format of error (2nd argument)
            // we pass doesn't match setError's types but it works somehow.
            handleError(
              `${fieldArrayKey}.${key}.${errorKey}`,
              typeof errorValue === 'string'
                ? { error: errorValue }
                : errorValue
            );
          });
        } else {
          const errorValue = error.errors[key][0];
          // handleError is (nearly) always methods.setError from what I can see. The format of error (2nd argument)
          // we pass doesn't match setError's types but it works somehow.
          handleError(
            key,
            typeof errorValue === 'string' ? { error: errorValue } : errorValue
          );
        }
      })
    : handleError('submissionError', {
        type: 'server',
      });
};

export const handleHookFormSubmissionError = (
  error: Error | CLErrorsWrapper,
  handleError: (error: string, options: Record<string, any>) => void,
  fieldArrayKey?: string
) => {
  if (isCLErrorsWrapper(error)) {
    handleCLErrorWrapper(error, handleError, fieldArrayKey);
  } else {
    handleError('submissionError', {
      type: 'server',
    });
  }
};

export const handleBlockedUserError = (status: number, data: CLErrors) => {
  if (
    status === 401 &&
    isObject(data) &&
    isObject(data.errors) &&
    'base' in data.errors &&
    Array.isArray(data.errors.base) &&
    data.errors.base.length >= 0 &&
    'error' in data.errors.base[0] &&
    data.errors.base[0].error === 'blocked' &&
    window.location.href.indexOf('disabled-account') === -1
  ) {
    clHistory.push(
      `/disabled-account?date=${data.errors.base[0].details.block_end_at}`
    );
  }
};

export const isUnauthorizedRQ = (obj: unknown): obj is CLErrors => {
  if (
    isObject(obj) &&
    'errors' in obj &&
    'base' in obj.errors &&
    Array.isArray(obj.errors.base) &&
    obj.errors.base.length >= 0 &&
    'error' in obj.errors.base[0] &&
    obj.errors.base[0].error === 'Unauthorized!'
  ) {
    return true;
  }

  return false;
};
