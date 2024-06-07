import React, { useState, useEffect } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { JsonSchema7, Layout, isCategorization } from '@jsonforms/core';
import { ErrorObject } from 'ajv';

import { AuthenticationContext } from 'api/authentication/authentication_requirements/types';
import useCustomFieldsSchema from 'api/custom_fields_json_form_schema/useCustomFieldsSchema';
import useAuthUser from 'api/me/useAuthUser';
import { IUser } from 'api/users/types';

import useLocale from 'hooks/useLocale';

import Fields from 'components/Form/Components/Fields';
import { parseRequiredMultilocsData } from 'components/Form/parseRequiredMultilocs';

import messages from './messages';

// Todo :
/*
- InputControl : implement long input, implement numeric
- Rework, test and document labels (show optional, make variants clear)
- Single select enum : move options to uischema
- Multi select enum : move options to uischema
*/

interface Props {
  onChange: (formData: Record<string, any>) => void;
}

interface OuterProps extends Props {
  authenticationContext: AuthenticationContext;
}

interface InnerProps extends Props {
  authUser: IUser;
  schema: JsonSchema7;
  uiSchema: Layout;
}

const UserCustomFieldsForm = ({
  authUser,
  schema,
  uiSchema,
  onChange,
}: InnerProps) => {
  const locale = useLocale();

  const initialFormData = authUser.data.attributes.custom_field_values;

  const [data, setData] = useState(() => {
    return parseRequiredMultilocsData(schema, locale, initialFormData);
  });

  useEffect(() => {
    setData(parseRequiredMultilocsData(schema, locale, initialFormData));
  }, [schema, locale, initialFormData]);

  const getAjvErrorMessage = (error: ErrorObject) => {
    switch (error.keyword) {
      case 'required':
        return messages[`ajv_error_${error?.params?.missingProperty}_required`];
      default:
        return undefined;
    }
  };

  const layout = isCategorization(uiSchema) ? 'fullpage' : 'inline';

  return (
    <Box overflow={layout === 'inline' ? 'visible' : 'auto'} flex="1">
      <Fields
        data={data}
        schema={schema}
        uiSchema={uiSchema}
        getAjvErrorMessage={getAjvErrorMessage}
        locale={locale}
        onChange={(data) => {
          data && onChange?.(data);
        }}
      />
    </Box>
  );
};

const UserCustomFieldsFormWrapper = ({
  authenticationContext,
  ...props
}: OuterProps) => {
  const { data: authUser } = useAuthUser();
  const { data: userCustomFieldsSchema } = useCustomFieldsSchema(
    authenticationContext
  );
  const locale = useLocale();

  if (!authUser || !userCustomFieldsSchema) return null;

  const { json_schema_multiloc, ui_schema_multiloc } =
    userCustomFieldsSchema.data.attributes;

  const schema = json_schema_multiloc[locale];
  const uiSchema = ui_schema_multiloc[locale];

  if (!schema || !uiSchema) return null;

  return (
    <UserCustomFieldsForm
      authUser={authUser}
      schema={schema}
      uiSchema={uiSchema}
      {...props}
    />
  );
};

export default UserCustomFieldsFormWrapper;
