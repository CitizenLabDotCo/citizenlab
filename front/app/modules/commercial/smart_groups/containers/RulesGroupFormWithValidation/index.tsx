import React from 'react';

import useVerificationMethod from 'api/id_methods/useVerificationMethod';

import RulesGroupForm, { RulesFormValues } from './RulesGroupForm';

interface Props {
  onSubmit: (values: RulesFormValues) => Promise<void>;
  initialValues: Partial<RulesFormValues>;
}

const RulesGroupFormWithValidation = ({
  onSubmit,
  initialValues = {
    rules: [{}],
    membership_type: 'rules',
    memberships_count: 0,
  },
}: Props) => {
  const { data: firstVerificationMethod, isLoading } = useVerificationMethod();
  if (isLoading) return null;

  return (
    <RulesGroupForm
      defaultValues={initialValues}
      onSubmit={onSubmit}
      isVerificationEnabled={!!firstVerificationMethod}
    />
  );
};

export default RulesGroupFormWithValidation;
