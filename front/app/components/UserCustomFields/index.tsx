import React, { useEffect } from 'react';

import { FormProvider } from 'react-hook-form';

import { AuthenticationContext } from 'api/authentication/authentication_requirements/types';
import usePermissionsCustomFields from 'api/permissions_custom_fields/usePermissionsCustomFields';

import CustomFields from 'components/CustomFieldsForm/CustomFields';
import usePageForm from 'components/CustomFieldsForm/Page/usePageForm';

interface Props {
  onChange: (formData: Record<string, any>) => void;
  authenticationContext: AuthenticationContext;
  formData?: Record<string, any>;
}

const UserCustomFieldsForm = ({
  authenticationContext,
  formData,
  onChange,
}: Props) => {
  const { data: customFields } = usePermissionsCustomFields(
    authenticationContext
  );
  const { methods } = usePageForm({
    pageQuestions: customFields || [],
    defaultValues: formData,
  });

  useEffect(() => {
    const subscription = methods.watch((value) => {
      onChange(value);
    });
    return () => subscription.unsubscribe();
  }, [methods, onChange]);

  if (!customFields) return null;

  return (
    <FormProvider {...methods}>
      <CustomFields questions={customFields} />
    </FormProvider>
  );
};

export default UserCustomFieldsForm;
