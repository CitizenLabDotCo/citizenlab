import React from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useUserCustomFieldsSchema from '../../hooks/useUserCustomFieldsSchema';

// components
import UserCustomFieldsFormOld from './UserCustomFieldsFormOld';
import UserCustomFieldsFormMigrated from './UserCustomFieldsFormMigrated';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IUserData } from 'services/users';

type FormData = Record<string, any>;

interface Props {
  authUser: IUserData;
  onSubmit?: (data: { key: string; formData: FormData }) => void;
  onChange?: (data: { key: string; formData: FormData }) => void;
}

const UserCustomFieldsForm = (props: Props) => {
  const userCustomFieldsSchema = useUserCustomFieldsSchema();
  const useJSONForm = useFeatureFlag({
    name: 'jsonforms_custom_fields',
  });

  const hasCustomFields =
    !isNilOrError(userCustomFieldsSchema) &&
    userCustomFieldsSchema.hasCustomFields;

  if (!hasCustomFields) return null;

  if (useJSONForm) {
    return <UserCustomFieldsFormMigrated {...props} />;
  }

  return <UserCustomFieldsFormOld {...props} />;
};

export default UserCustomFieldsForm;
