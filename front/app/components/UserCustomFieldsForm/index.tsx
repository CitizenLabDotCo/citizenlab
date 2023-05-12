import React from 'react';

// hooks
import useCustomFieldsSchema from 'api/custom_fields_json_form_schema/useCustomFieldsSchema';
import useLocale from 'hooks/useLocale';

// components
import Form from 'components/Form';

// i18n
import messages from './messages';

// utils
import { forOwn } from 'lodash-es';

// typings
import { ErrorObject } from 'ajv';
import { IUserData } from 'services/users';
import { isNilOrError } from 'utils/helperUtils';
import { AuthenticationContext } from 'api/authentication/authentication_requirements/types';

// TODO test
// import { data } from './data';

// Todo :
/*
- InputControl : implement long input, implement numeric
- Rework, test and document labels (show optional, make variants clear)
- Single select enum : move options to uischema
- Multi select enum : move options to uischema
*/

export interface UserCustomFieldsFormProps {
  authUser: IUserData;
  authenticationContext: AuthenticationContext;
  onSubmit?: (data: { key: string; formData: Record<string, any> }) => void;
  onChange?: (data: { key: string; formData: Record<string, any> }) => void;
}

export default ({
  authUser,
  authenticationContext,
  onSubmit,
  onChange,
}: UserCustomFieldsFormProps) => {
  const { data: userCustomFieldsSchema } = useCustomFieldsSchema(
    authenticationContext
  );

  // const { data: userCustomFieldsSchema2 } = useCustomFieldsSchema(
  //   authenticationContext
  // );
  // const userCustomFieldsSchema = { data } ?? userCustomFieldsSchema2;

  const locale = useLocale();

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
      />
    );
  }

  return null;
};
