import React from 'react';

import { ErrorObject } from 'ajv';
import { forOwn } from 'lodash-es';

import { AuthenticationContext } from 'api/authentication/authentication_requirements/types';
import useCustomFieldsSchema from 'api/custom_fields_json_form_schema/useCustomFieldsSchema';
import { IUserData } from 'api/users/types';

import useLocale from 'hooks/useLocale';

import Form from 'components/Form';
import { FormData } from 'components/Form/typings';

import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

// Todo :
/*
- InputControl : implement long input, implement numeric
- Rework, test and document labels (show optional, make variants clear)
- Single select enum : move options to uischema
- Multi select enum : move options to uischema
*/

interface UserCustomFieldsFormProps {
  authUser: IUserData;
  authenticationContext: AuthenticationContext;
  onSubmit?: (data: { key: string; formData: Record<string, any> }) => void;
  onChange?: (data: { key: string; formData: Record<string, any> }) => void;
  parentSubmit?: (e: any) => void;
}

const UserCustomFieldsForm = ({
  authUser,
  authenticationContext,
  onSubmit,
  onChange,
  parentSubmit,
}: UserCustomFieldsFormProps) => {
  const { data: userCustomFieldsSchema } = useCustomFieldsSchema(
    authenticationContext
  );

  const locale = useLocale();

  const handleOnSubmit = (formData: FormData) => {
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

  if (userCustomFieldsSchema && !isNilOrError(locale)) {
    if (!userCustomFieldsSchema.data.attributes) return null;
    const { json_schema_multiloc, ui_schema_multiloc } =
      userCustomFieldsSchema.data.attributes;

    const schema = json_schema_multiloc[locale];
    const uiSchema = ui_schema_multiloc[locale];

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
        parentSubmit={parentSubmit}
      />
    );
  }

  return null;
};

export default UserCustomFieldsForm;
