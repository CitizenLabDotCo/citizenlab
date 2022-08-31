import React from 'react';

import RulesGroupForm, { RulesFormValues } from './RulesGroupForm';
import { IGroupDataAttributes } from 'services/groups';

interface Props {
  onSubmit: (values: RulesFormValues) => Promise<void>;
  isVerificationEnabled: boolean;
  initialValues: Partial<IGroupDataAttributes>;
}

const RulesGroupFormWithValidation = ({
  onSubmit,
  isVerificationEnabled,
  initialValues = {
    rules: [{}],
    membership_type: 'rules',
    memberships_count: 0,
  },
}: Props) => {
  return (
    <RulesGroupForm
      defaultValues={initialValues}
      onSubmit={onSubmit}
      isVerificationEnabled={isVerificationEnabled}
    />
  );
};

export default RulesGroupFormWithValidation;
