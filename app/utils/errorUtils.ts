import merge from 'deepmerge';
import { remove } from 'lodash-es';

export function isCLErrorJSON(error) {
  return !!(error && error.json && error.json.errors);
}

export function addErrorPayload(errors, fieldName, errorType, payload) {
  const error = errors[fieldName].find(({ error }) => error === errorType);

  if (error) {
    const transformedErrors = remove(
      errors,
      ({ error }) => error === errorType
    );

    const errorsWithPayload = {
      [fieldName]: [{ ...error, payload }],
    };

    return merge(transformedErrors, errorsWithPayload);
  }

  return errors;
}
