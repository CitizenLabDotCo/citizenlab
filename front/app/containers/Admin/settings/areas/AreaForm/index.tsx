import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { Multiloc } from 'typings';
import { object } from 'yup';

import { Section, SectionField } from 'components/admin/Section';
import Feedback from 'components/HookForm/Feedback';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';

import messages from '../messages';

export interface FormValues {
  title_multiloc: Multiloc;
}

type Props = {
  onSubmit: (formValues: FormValues) => void | Promise<void>;
  defaultValues?: FormValues;
};

const AreaForm = ({ defaultValues, onSubmit }: Props) => {
  const { formatMessage } = useIntl();
  const schema = object({
    title_multiloc: validateMultilocForEveryLocale(
      formatMessage(messages.fieldTitleError)
    ),
    description_multiloc: object(),
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
    <Section>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onFormSubmit)}
          data-testid="areaForm"
        >
          <SectionField>
            <Feedback />
            <InputMultilocWithLocaleSwitcher
              label={formatMessage(messages.fieldTitle)}
              name="title_multiloc"
              labelTooltipText={formatMessage(messages.fieldTitleTooltip)}
            />
          </SectionField>
          <Box display="flex">
            <Button
              type="submit"
              processing={methods.formState.isSubmitting}
              data-testid="saveArea"
            >
              {formatMessage(messages.saveArea)}
            </Button>
          </Box>
        </form>
      </FormProvider>
    </Section>
  );
};

export default AreaForm;
