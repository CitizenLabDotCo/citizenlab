import React from 'react';

import { isNilOrError } from 'utils/helperUtils';

// typings
import { IUserData } from 'services/users';

// utils
import Form from 'components/Form';
import { forOwn } from 'lodash-es';
import useUserJsonFormsSchemas from '../../../hooks/useUserJsonFormSchemas';
import { ErrorObject } from 'ajv';
import messages from './messages';

// Todo :
/*
- InputControl : implement long input, implement numeric
- Rework, test and document labels (show optional, make variants clear)
- Single select enum : move options to uischema
- Multi select enum : move options to uischema
*/

export interface UserCustomFieldsFormProps {
  authUser: IUserData;
  onSubmit?: (data: { key: string; formData: Record<string, any> }) => void;
  onChange?: (data: { key: string; formData: Record<string, any> }) => void;
}

export default ({
  onSubmit,
  onChange,
  authUser,
}: UserCustomFieldsFormProps) => {
  const userCustomFieldsSchemas = useUserJsonFormsSchemas();

  const handleOnSubmit = (formData) => {
    const sanitizedFormData = {};

    forOwn(formData, (value, key) => {
      sanitizedFormData[key] = value === null ? undefined : value;
    });

    onSubmit?.({
      formData: sanitizedFormData,
      key: 'custom_field_values',
    });
    // Todo change usage of this compnent so submit returns the promise (better error handling)
    return new Promise(() => {});
  };

  const getAjvErrorMessage = (error: ErrorObject) => {
    switch (error.keyword) {
      case 'required':
        return messages[`ajv_error_${error?.params?.missingProperty}_required`];
      default:
        return undefined;
    }
  };

  if (!isNilOrError(userCustomFieldsSchemas)) {
    const { schema, uiSchema } = userCustomFieldsSchemas;

    if (!schema || !uiSchema) return null;

    return (
      <Form
        schema={schema}
        uiSchema={uiSchema}
        onSubmit={handleOnSubmit}
        onChange={(formData) =>
          formData &&
          onChange?.({
            formData,
            key: 'custom_field_values',
          })
        }
        getAjvErrorMessage={getAjvErrorMessage}
        submitOnEvent="customFieldsSubmitEvent"
        initialFormData={authUser.attributes.custom_field_values}
      />
    );
  }

  return null;
};
