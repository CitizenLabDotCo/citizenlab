import React from 'react';

import { isNilOrError } from 'utils/helperUtils';

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
- InputControl : show optional, implement long input, implement numeric
- Single select enum : new Control, support enumOption or move options to uischema
- Multi select enum : new Control, support enumOption or move options to uischema
- DateInput
- Checkbox
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
  const userCustomFieldsSchema = useUserCustomFieldsSchema();

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

  if (!isNilOrError(userCustomFieldsSchema)) {
    const { schema, uiSchema } = userCustomFieldsSchema;
    const newSchema = {
      type: 'VerticalLayout',
      options: {
        submit: 'event',
        order: uiSchema['ui:order'],
      },
      elements: uiSchema['ui:order'].map((e) => {
        return {
          type: 'Control',
          scope: `#/properties/${e}`,
          options: {
            hidden: uiSchema?.[e]?.['ui:widget'] === 'hidden',
          },
        };
      }),
    };

    // const requiredFields = schema.filter()

    return (
      <Container>
        {schema && uiSchema && (
          <Form
            schema={schema}
            uiSchema={newSchema}
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
        )}
      </Container>
    );
  }

  return null;
};
