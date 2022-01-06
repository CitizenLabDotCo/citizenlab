import React, { useEffect } from 'react';

import { isNilOrError } from 'utils/helperUtils';

// components
// import { FormLabelValue } from 'components/UI/FormComponents';
import {
  ExtraFormDataConfiguration,
  ExtraFormDataKey,
} from 'containers/UsersEditPage/ProfileForm';

// styling
import styled from 'styled-components';

// typings
import { IUserData } from 'services/users';

// utils
import useUserCustomFieldsSchema from 'modules/commercial/user_custom_fields/hooks/useUserCustomFieldsSchema';
import Form from 'components/Form';
import { forOwn } from 'lodash-es';

const Container = styled.div``;

// Todo :
/*
- Cleanup
- Figure our ref and events
- Change library
- InputControl : show optional, implement long input, implement numeric
- Single select enum : new Control, support enumOption or move options to uischema
- Multi select enum : new Control, support enumOption or move options to uischema
- DateInput
- Checkbox
*/

type FormData = Record<string, any> | null;
export interface UserCustomFieldsFormProps {
  authUser: IUserData;
  onSubmit: (data: { key: string; formData: FormData }) => void;
  onChange?: () => void;
  onData?: (data: {
    key: ExtraFormDataKey;
    data: ExtraFormDataConfiguration;
  }) => void;
}

export default ({
  authUser,
  onSubmit,
  // onChange,
  onData,
}: UserCustomFieldsFormProps) => {
  const userCustomFieldsSchema = useUserCustomFieldsSchema();

  const handleOnSubmit = (formData) => {
    const sanitizedFormData = {};

    forOwn(formData, (value, key) => {
      sanitizedFormData[key] = value === null ? undefined : value;
    });

    onSubmit({
      formData,
      key: 'custom_field_values',
    });
    // Todo change usage of this compnent so submit returns the promise (better error handling)
    return new Promise(() => {});
  };

  useEffect(() => {
    onData?.({
      key: 'custom_field_values',
      data: {
        submit: () => handleOnSubmit,
      },
    });
  }, []);

  if (!isNilOrError(userCustomFieldsSchema)) {
    const { schema, uiSchema } = userCustomFieldsSchema;
    const newSchema = {
      type: 'VerticalLayout',
      options: {
        submit: 'event',
        order: uiSchema['ui:order'],
      },
      elements: uiSchema['ui:order'].map((e) => ({
        type: 'Control',
        scope: `#/properties/${e}`,
      })),
    };
    console.log(schema, uiSchema, newSchema);

    return (
      <Container>
        {schema && uiSchema && (
          <Form
            schema={schema}
            uiSchema={newSchema}
            onSubmit={handleOnSubmit}
            submitOnEvent="customFieldsSubmitEvent"
            initialFormData={authUser.attributes.custom_field_values}
          />
        )}
      </Container>
    );
  }

  return null;
};

// function renderLabel(id, label, required, descriptionJSX) {
//   if (label && label.length > 0) {
//     return (
//       <FormLabelValue
//         htmlFor={id}
//         labelValue={label}
//         optional={!required}
//         subtextValue={descriptionJSX}
//       />
//     );
//   }
//   return;
// }
