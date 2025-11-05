import React, { useEffect } from 'react';

import { FormProvider } from 'react-hook-form';

import { AuthenticationContext } from 'api/authentication/authentication_requirements/types';
import useUserCustomFieldsForPermission from 'api/user_custom_fields_for_permission/useUserCustomFieldsForPermission';

import CustomFields from 'components/CustomFieldsForm/CustomFields';
import usePageForm from 'components/CustomFieldsForm/Page/usePageForm';

interface Props {
  onChange: (formData: Record<string, any>) => void;
  authenticationContext: AuthenticationContext;
  formData?: Record<string, any>;
  triggerValidation?: boolean;
  onValidationResult?: (isValid: boolean) => void;
}

const UserCustomFieldsForm = ({
  authenticationContext,
  formData,
  onChange,
  triggerValidation,
  onValidationResult,
}: Props) => {
  const { data: customFields } = useUserCustomFieldsForPermission(
    authenticationContext
  );
  const { methods } = usePageForm({
    pageQuestions: customFields || [],
    defaultValues: formData,
  });

  // Effect to handle validation trigger from parent
  useEffect(() => {
    if (triggerValidation && onValidationResult) {
      const validateForm = async () => {
        const isValid = await methods.trigger();
        onValidationResult(isValid);
      };
      validateForm();
    }
  }, [triggerValidation, onValidationResult, methods]);

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
