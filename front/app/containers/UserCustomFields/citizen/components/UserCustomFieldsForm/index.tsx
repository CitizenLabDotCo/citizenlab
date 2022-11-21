import React from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import UserCustomFieldsFormOld from './UserCustomFieldsFormOld';
import UserCustomFieldsFormMigrated from './UserCustomFieldsFormMigrated';

// typings
import { IUserData } from 'services/users';

type FormData = Record<string, any>;

interface Props {
  authUser: IUserData;
  onSubmit?: (data: { key: string; formData: FormData }) => void;
  onChange?: (data: { key: string; formData: FormData }) => void;
}

const UserCustomFieldsForm = (props: Props) => {
  const useJSONForm = useFeatureFlag({
    name: 'jsonforms_custom_fields',
  });

  if (useJSONForm) {
    return <UserCustomFieldsFormMigrated {...props} />;
  }

  return <UserCustomFieldsFormOld {...props} />;
};

export default UserCustomFieldsForm;
