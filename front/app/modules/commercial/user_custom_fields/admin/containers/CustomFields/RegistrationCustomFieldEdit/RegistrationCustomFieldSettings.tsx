import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { useParams } from 'react-router-dom';

import {
  updateCustomFieldForUsers,
  isBuiltInField,
} from '../../../../services/userCustomFields';
import useUserCustomField from '../../../../hooks/useUserCustomField';

import RegistrationCustomFieldForm, {
  FormValues,
} from '../RegistrationCustomFieldForm';

const RegistrationCustomFieldSettings = () => {
  const { userCustomFieldId } = useParams() as { userCustomFieldId: string };
  const customField = useUserCustomField(userCustomFieldId);

  if (isNilOrError(customField)) return null;

  const initialValues = () => {
    return (
      customField && {
        input_type: customField.attributes.input_type,
        title_multiloc: customField.attributes.title_multiloc,
        description_multiloc: customField.attributes.description_multiloc,
        required: customField.attributes.required,
        enabled: customField.attributes.enabled,
      }
    );
  };

  const handleSubmit = async (values: FormValues) => {
    if (!customField) return;
    await updateCustomFieldForUsers(customField.id, values);
  };

  return (
    <RegistrationCustomFieldForm
      defaultValues={initialValues()}
      onSubmit={handleSubmit}
      mode="edit"
      customFieldId={customField.id}
      builtInField={isBuiltInField(customField)}
    />
  );
};

export default RegistrationCustomFieldSettings;
