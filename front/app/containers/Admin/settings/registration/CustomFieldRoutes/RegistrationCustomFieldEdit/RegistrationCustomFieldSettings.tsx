import React from 'react';
import { useParams } from 'react-router-dom';

import useUserCustomField from 'api/user_custom_fields/useUserCustomField';

import RegistrationCustomFieldForm, {
  FormValues,
} from '../RegistrationCustomFieldForm';
import useUpdateUserCustomField from 'api/user_custom_fields/useUpdateUserCustomField';
import { isBuiltInField } from 'api/user_custom_fields/util';

const RegistrationCustomFieldSettings = () => {
  const { userCustomFieldId } = useParams() as { userCustomFieldId: string };
  const { data: customField } = useUserCustomField(userCustomFieldId);
  const { mutate: updateCustomFieldForUsers } = useUpdateUserCustomField();

  if (!customField) return null;

  const initialValues = () => {
    return (
      customField && {
        input_type: customField.data.attributes.input_type,
        title_multiloc: customField.data.attributes.title_multiloc,
        description_multiloc: customField.data.attributes.description_multiloc,
        required: customField.data.attributes.required,
        enabled: customField.data.attributes.enabled,
      }
    );
  };

  const handleSubmit = (values: FormValues) => {
    if (!customField) return;
    updateCustomFieldForUsers({
      customFieldId: customField.data.id,
      ...values,
    });
  };

  return (
    <RegistrationCustomFieldForm
      defaultValues={initialValues()}
      onSubmit={handleSubmit}
      mode="edit"
      customFieldId={customField.data.id}
      builtInField={isBuiltInField(customField.data)}
    />
  );
};

export default RegistrationCustomFieldSettings;
