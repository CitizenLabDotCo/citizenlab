import React from 'react';

import { Formik, FormikErrors } from 'formik';
import RulesGroupForm, { RulesFormValues } from './RulesGroupForm';
import { isEmpty, values as getValues, every } from 'lodash-es';
import { IGroupDataAttributes } from 'services/groups';
import { FormikSubmitHandler } from 'typings';
import { NormalFormValues } from 'containers/Admin/users/NormalGroupForm';

interface Props {
  onSubmit: FormikSubmitHandler<NormalFormValues>;
  isVerificationEnabled: boolean;
  initialValues: IGroupDataAttributes;
}

const renderRulesGroupForm = (props) => <RulesGroupForm {...props} />;

const RulesGroupFormWithValidation = ({
  onSubmit,
  isVerificationEnabled,
  initialValues = {
    title_multiloc: {},
    rules: [{}],
    membership_type: 'rules',
    memberships_count: 0,
  },
}: Props) => {
  const validate = (values: RulesFormValues) => {
    const errors: FormikErrors<RulesFormValues> = {};

    if (every(getValues(values.title_multiloc), isEmpty)) {
      errors.title_multiloc = [{ error: 'blank' }] as any;
    }

    if (
      !isVerificationEnabled &&
      values.rules.find((rule) => rule.ruleType === 'verified')
    ) {
      errors.rules = 'verificationDisabled' as any;
    }

    return errors;
  };

  return (
    <Formik
      initialValues={initialValues}
      validate={validate}
      render={renderRulesGroupForm}
      onSubmit={onSubmit}
    />
  );
};

export default RulesGroupFormWithValidation;
