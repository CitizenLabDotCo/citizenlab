import React from 'react';

import { isNilOrError } from 'utils/helperUtils';

// typings
import { IUserData } from 'services/users';

// utils
import Form from 'components/Form';
import { forOwn } from 'lodash-es';
import useUserJsonFormsSchemas from '../../../hooks/useUserJsonFormSchemas';

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
  if (!isNilOrError(userCustomFieldsSchemas)) {
    const {
      json_schema_multiloc: schemaMultiloc,
      ui_schema_multiloc: uiSchemaMultiloc,
    } = userCustomFieldsSchemas;

    return (
      <Form
        schemaMultiloc={schemaMultiloc}
        uiSchemaMultiloc={uiSchemaMultiloc}
        onSubmit={handleOnSubmit}
        onChange={(formData) =>
          onChange?.({
            formData,
            key: 'custom_field_values',
          })
        }
        submitOnEvent="customFieldsSubmitEvent"
        initialFormData={authUser.attributes.custom_field_values}
      />
    );
  }

  return null;
};
