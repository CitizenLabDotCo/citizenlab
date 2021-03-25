import merge from 'deepmerge';
import { remove } from 'lodash-es';
import { CLError } from 'typings';

export function isCLErrorJSON(error) {
  return !!(error && error.json && error.json.errors);
}

//
// Adds translation [values] to ApiErrors to be displayed with an <Error/> Component.
//
// Example:
//
//    @errors       { name: [{ error: 'is_invalid'}, { error: 'blank' }], description: [{ error: 'blank' }] }
//    @fieldName    'name'
//    @errorType    'blank'
//    @payload      { link: <Link to="/some_path_to_add_name" /> }
//
//    @return       { name: [{ error: 'is_invalid'}, { error: 'blank', payload: { link: <Link to="/some_path_to_add_name" /> }  }], description: [{ error: 'blank' }] }
//
export function addErrorPayload(
  errors: CLError[],
  fieldName: string,
  errorType: string,
  payload: Object
) {
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
