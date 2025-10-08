import React from 'react';

import { AuthenticationContext } from 'api/authentication/authentication_requirements/types';
import useAuthUser from 'api/me/useAuthUser';
import usePermissionsCustomFields from 'api/permissions_custom_fields/usePermissionsCustomFields';

import CustomFields from 'components/CustomFieldsForm/CustomFields';

interface Props {
  showAllErrors: boolean;
  setShowAllErrors: (showAllErrors: boolean) => void;
  onChange: (formData: Record<string, any>) => void;
}

interface OuterProps extends Props {
  authenticationContext: AuthenticationContext;
}

const UserCustomFieldsForm = ({ authenticationContext }: OuterProps) => {
  const { data: authUser } = useAuthUser();
  const { data: customFields } = usePermissionsCustomFields(
    authenticationContext
  );

  if (!authUser || !customFields) return null;

  return <CustomFields questions={customFields as any} />;
};

export default UserCustomFieldsForm;
