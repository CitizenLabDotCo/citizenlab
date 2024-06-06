import React from 'react';

import { ErrorObject } from 'ajv';
import { forOwn } from 'lodash-es';

import { AuthenticationContext } from 'api/authentication/authentication_requirements/types';
import useCustomFieldsSchema from 'api/custom_fields_json_form_schema/useCustomFieldsSchema';
import useAuthUser from 'api/me/useAuthUser';

import useLocale from 'hooks/useLocale';

import Form from 'components/Form';
import FormWrapper from 'components/Form/FormWrapper';
import { FormData } from 'components/Form/typings';

import messages from './messages';

// Todo :
/*
- InputControl : implement long input, implement numeric
- Rework, test and document labels (show optional, make variants clear)
- Single select enum : move options to uischema
- Multi select enum : move options to uischema
*/

interface UserCustomFieldsFormProps {
  authenticationContext: AuthenticationContext;
  onSubmit?: (data: {
    key: string;
    formData: Record<string, any>;
  }) => Promise<void>;
  onChange?: (data: { key: string; formData: Record<string, any> }) => void;
}

const UserCustomFieldsForm = ({
  authenticationContext,
  onSubmit,
  onChange,
}: UserCustomFieldsFormProps) => {
  const { data: authUser } = useAuthUser();

  const { data: userCustomFieldsSchema } = useCustomFieldsSchema(
    authenticationContext
  );

  const locale = useLocale();

  const handleOnSubmit = async (formData: FormData) => {
    const sanitizedFormData = {};

    forOwn(formData, (value, key) => {
      sanitizedFormData[key] = value === null ? undefined : value;
    });

    return await onSubmit?.({
      formData: sanitizedFormData,
      key: 'custom_field_values',
    });
  };

  const getAjvErrorMessage = (error: ErrorObject) => {
    switch (error.keyword) {
      case 'required':
        return messages[`ajv_error_${error?.params?.missingProperty}_required`];
      default:
        return undefined;
    }
  };

  if (userCustomFieldsSchema && locale && authUser) {
    if (!userCustomFieldsSchema.data.attributes) return null;
    const { json_schema_multiloc, ui_schema_multiloc } =
      userCustomFieldsSchema.data.attributes;

    const schema = json_schema_multiloc[locale];
    const uiSchema = ui_schema_multiloc[locale];

    if (!schema || !uiSchema) return null;

    return (
      <FormWrapper formId={uiSchema?.options?.formId}>
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
          initialFormData={authUser.data.attributes.custom_field_values}
        />
      </FormWrapper>
    );
  }

  return null;
};

export default UserCustomFieldsForm;
