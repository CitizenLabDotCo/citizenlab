import React from 'react';

import { Formik, FormikErrors } from 'formik';
import RulesGroupForm, { RulesFormValues } from './RulesGroupForm';
import { isEmpty, values as getValues, every } from 'lodash-es';

const RulesGroupFormWithValidation = ({ onSubmit, isVerificationEnabled }) => {
  const renderRulesGroupForm = (props) => <RulesGroupForm {...props} />;

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
      initialValues={{
        title_multiloc: {},
        rules: [{}],
        membership_type: 'rules',
      }}
      validate={validate}
      render={renderRulesGroupForm}
      onSubmit={onSubmit}
    />
  );
};

export default RulesGroupFormWithValidation;
