import React from 'react';

// hooks
import useUserCustomFieldsSchema from 'hooks/useUserCustomFieldsSchema';

// components
import UserCustomFieldsFormOld from './UserCustomFieldsFormOld';

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

  const hasCustomFields =
    !isNilOrError(userCustomFieldsSchema) &&
    userCustomFieldsSchema.hasCustomFields;

  if (!hasCustomFields) return null;

  return <UserCustomFieldsFormOld {...props} />;
};

export default UserCustomFieldsForm;
