// Libraries
import React from 'react';

// Components
import { SectionField } from 'components/admin/Section';

import { FooterContainer, Fill } from 'containers/Admin/users/NormalGroupForm';

import { Button, Label } from '@citizenlab/cl2-component-library';
import { HookFormUserFilterConditions } from '../../components/UserFilterConditions';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';
import { WrappedComponentProps } from 'react-intl';
import adminUsersMessages from 'containers/Admin/users/messages';

// Styling
import styled from 'styled-components';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object, array, number } from 'yup';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import Feedback from 'components/HookForm/Feedback';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';

const SSectionField = styled(SectionField)`
  max-width: 570px;
`;

// Typings
import { Multiloc } from 'typings';
import { TRule } from '../../components/UserFilterConditions/rules';

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
} & WrappedComponentProps;

const RulesGroupForm = ({
  intl: { formatMessage },
  onSubmit,
  defaultValues,
  isVerificationEnabled,
}: Props) => {
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
      .min(1, formatMessage(messages.atLeastOneRuleError)),
    membership_type: string().oneOf(['rules']).required(),
    memberships_count: number(),
  });

  const methods = useForm({
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

export default injectIntl(RulesGroupForm);
