import React from 'react';

import {
  Label,
  IconTooltip,
  Box,
  Button,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import styled from 'styled-components';
import { Multiloc } from 'typings';
import { string, object } from 'yup';

import {
  IdeaStatusParticipationMethod,
  InputStatusCode,
} from 'api/idea_statuses/types';

import { Section, SectionField } from 'components/admin/Section';
import ColorPicker from 'components/HookForm/ColorPicker';
import Feedback from 'components/HookForm/Feedback';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import TextAreaMultilocWithLocaleSwitcher from 'components/HookForm/TextAreaMultilocWithLocaleSwitcher';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';

import IdeationStatusCategories from './IdeationStatusCategories';
import messages from './messages';
import ProposalStatusCategories from './ProposalStatusCategories';

export interface FormValues {
  color: string;
  code: InputStatusCode;
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
}

export type Props = {
  onSubmit: (formValues: FormValues) => void | Promise<void>;
  defaultValues?: Partial<FormValues>;
  showCategorySelector?: boolean;
  variant: IdeaStatusParticipationMethod;
};

const StyledSection = styled(Section)`
  margin-bottom: 40px;
`;

const StyledLabel = styled(Label)`
  margin-bottom: 32px;
`;

const IdeaStatusForm = ({
  defaultValues,
  onSubmit,
  showCategorySelector,
  variant,
}: Props) => {
  const { formatMessage } = useIntl();
  const schema = object({
    color: string(),
    title_multiloc: validateMultilocForEveryLocale(
      formatMessage(messages.fieldTitleError)
    ),
    description_multiloc: validateMultilocForEveryLocale(
      formatMessage(messages.fieldDescriptionError)
    ),
    code: string().required(),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await onSubmit(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onFormSubmit)}>
        <StyledSection>
          <SectionField>
            <Feedback />
          </SectionField>
          <SectionField>
            <ColorPicker
              label={formatMessage(messages.fieldColor)}
              name="color"
            />
          </SectionField>
        </StyledSection>
        <StyledSection>
          <SectionField>
            <InputMultilocWithLocaleSwitcher
              label={formatMessage(messages.fieldTitle)}
              name="title_multiloc"
            />
          </SectionField>
        </StyledSection>

        <StyledSection>
          <SectionField>
            <TextAreaMultilocWithLocaleSwitcher
              label={formatMessage(messages.fieldDescription)}
              name="description_multiloc"
            />
          </SectionField>
        </StyledSection>
        {showCategorySelector && (
          <StyledSection>
            <SectionField>
              <StyledLabel>
                <FormattedMessage {...messages.category} />
                <IconTooltip
                  content={
                    <FormattedMessage {...messages.categoryDescription} />
                  }
                />
              </StyledLabel>
              {variant === 'ideation' && <IdeationStatusCategories />}
              {variant === 'proposals' && <ProposalStatusCategories />}
            </SectionField>
          </StyledSection>
        )}
        <Box display="flex">
          <Button type="submit" processing={methods.formState.isSubmitting}>
            {formatMessage(messages.saveStatus)}
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default IdeaStatusForm;
