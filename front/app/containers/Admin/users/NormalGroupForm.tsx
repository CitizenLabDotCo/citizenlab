import React from 'react';

import { Button } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';
import { Multiloc } from 'typings';
import { object } from 'yup';

import { MembershipType } from 'api/groups/types';

import { SectionField } from 'components/admin/Section';
import Feedback from 'components/HookForm/Feedback';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';

import { injectIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';

import messages from './messages';

type Props = {
  onSubmit: (formValues: NormalFormValues) => void | Promise<void>;
  defaultValues?: Partial<NormalFormValues>;
} & WrappedComponentProps;

export interface NormalFormValues {
  title_multiloc: Multiloc;
  membership_type: MembershipType;
}

export const Fill = styled.div`
  padding-top: 40px;
  padding-bottom: 20px;
  padding-left: 40px;
  overflow-y: auto;
`;

export const FooterContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 40px;
  padding-bottom: 25px;
`;

const NormalGroupForm = ({
  defaultValues,
  onSubmit,
  intl: { formatMessage },
}: Props) => {
  const schema = object({
    // Ensure a value is entered for at least one language
    title_multiloc: validateAtLeastOneLocale(
      formatMessage(messages.fieldGroupNameEmptyError)
    ),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const onFormSubmit = async (formValues: NormalFormValues) => {
    try {
      await onSubmit(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onFormSubmit)}
        data-testid="normalGroupForm"
      >
        <Fill>
          <SectionField>
            <Feedback />
          </SectionField>
          <SectionField>
            <SectionField>
              <InputMultilocWithLocaleSwitcher
                label={formatMessage(messages.fieldGroupName)}
                name="title_multiloc"
              />
            </SectionField>
          </SectionField>
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

export default injectIntl(NormalGroupForm);
