import React from 'react';

import { Button, Label } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import styled from 'styled-components';
import { Multiloc } from 'typings';
import { string, object, array, number } from 'yup';

import adminUsersMessages from 'containers/Admin/users/messages';
import { FooterContainer, Fill } from 'containers/Admin/users/NormalGroupForm';

import { SectionField } from 'components/admin/Section';
import Feedback from 'components/HookForm/Feedback';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';

import { HookFormUserFilterConditions } from '../../components/UserFilterConditions';
import { TRule } from '../../components/UserFilterConditions/rules';

import messages from './messages';

const SSectionField = styled(SectionField)`
  max-width: 570px;
`;

export interface RulesFormValues {
  rules: TRule[];
  title_multiloc: Multiloc;
  membership_type: 'rules';
  memberships_count: number;
}

type Props = {
  onSubmit: (formValues: RulesFormValues) => void | Promise<void>;
  defaultValues?: Partial<RulesFormValues>;
  isVerificationEnabled: boolean;
};

const RulesGroupForm = ({
  onSubmit,
  defaultValues,
  isVerificationEnabled,
}: Props) => {
  const { formatMessage } = useIntl();

  const schema = object({
    // Ensure a value is entered for at least one language
    title_multiloc: validateAtLeastOneLocale(
      formatMessage(messages.titleFieldEmptyError)
    ),
    rules: array()
      .test(
        'verificationEnabled',
        formatMessage(messages.verificationDisabled),
        function (rules: TRule[]) {
          // Fails validation when a verification rule is added to a platform with disabled verification
          if (
            rules.find((rule) => rule.ruleType === 'verified') &&
            !isVerificationEnabled
          ) {
            return false;
          } else return true;
        }
      )
      .min(1, formatMessage(messages.atLeastOneRuleError))
      .required(),
    membership_type: string().oneOf(['rules']).required(),
    memberships_count: number().required(),
  });

  const methods = useForm<RulesFormValues>({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const onFormSubmit = async (formValues: RulesFormValues) => {
    try {
      await onSubmit(formValues);
    } catch (error) {
      if (error?.errors?.rules) {
        methods.setError('rules', {
          type: 'custom',
          message: formatMessage(messages.rulesError),
        });
      } else {
        handleHookFormSubmissionError(error, methods.setError);
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onFormSubmit)}>
        <Fill id="rules-group-inner-form">
          <SSectionField>
            <Feedback />
          </SSectionField>
          <SSectionField>
            <InputMultilocWithLocaleSwitcher
              label={formatMessage(adminUsersMessages.fieldGroupName)}
              name="title_multiloc"
              id="group-title-field"
            />
          </SSectionField>
          <SSectionField className="e2e-rules-field-section">
            <Label>
              <FormattedMessage {...messages.rulesExplanation} />
            </Label>

            <HookFormUserFilterConditions name="rules" />
          </SSectionField>
        </Fill>

        <FooterContainer>
          <Button type="submit" processing={methods.formState.isSubmitting}>
            {formatMessage(messages.saveGroup)}
          </Button>
        </FooterContainer>
      </form>
    </FormProvider>
  );
};

export default RulesGroupForm;
