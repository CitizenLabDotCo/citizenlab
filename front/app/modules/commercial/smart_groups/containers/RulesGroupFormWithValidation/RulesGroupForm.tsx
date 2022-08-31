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
import { InjectedIntlProps } from 'react-intl';
import adminUsersMessages from 'containers/Admin/users/messages';

// Styling
import styled from 'styled-components';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object, array } from 'yup';
import validateMultiloc from 'utils/yup/validateMultiloc';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import Feedback from 'components/HookForm/Feedback';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

const SSectionField = styled(SectionField)`
  max-width: 570px;
`;

// Typings
import { Multiloc } from 'typings';
import { TRule } from '../../components/UserFilterConditions/rules';

export interface RulesFormValues {
  rules: TRule[];
  title_multiloc: Multiloc;
  membership_type: 'rules' | 'manual';
}

type Props = {
  onSubmit: (formValues: RulesFormValues) => void | Promise<void>;
  defaultValues?: Partial<RulesFormValues>;
  isVerificationEnabled: boolean;
} & InjectedIntlProps;

const RulesGroupForm = ({
  intl: { formatMessage },
  onSubmit,
  defaultValues,
  isVerificationEnabled,
}: Props) => {
  const schema = object({
    title_multiloc: validateMultiloc('title error'),
    rules: array().required('add a rule'),
    membership_type: string().oneOf(['rules']).required(),
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
      handleHookFormSubmissionError(error, methods.setError);
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
              type="text"
              name="title_multiloc"
              id="group-title-field"
            />
          </SSectionField>
          <SSectionField className="e2e-rules-field-section">
            <Label>
              <FormattedMessage {...messages.rulesExplanation} />
            </Label>

            <HookFormUserFilterConditions
              name="rules"
              isVerificationEnabled={isVerificationEnabled}
            />
            {/* {touched.rules && errors.rules && (
              <Error
                text={
                  (errors.rules as any) === 'verificationDisabled' ? (
                    <FormattedMessage {...messages.verificationDisabled} />
                  ) : (
                    <FormattedMessage {...messages.rulesError} />
                  )
                }
              />
            )} */}
          </SSectionField>
        </Fill>

        <FooterContainer>
          <Button type="submit" processing={methods.formState.isSubmitting}>
            save
          </Button>
        </FooterContainer>
      </form>
    </FormProvider>
  );
};

export default injectIntl(RulesGroupForm);
